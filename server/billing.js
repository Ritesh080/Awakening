import { Router } from "express";
import Stripe from "stripe";
import { q, isPremium } from "./db.js";
import { requireAuth, publicUser } from "./auth.js";

// Billing runs in one of two modes:
//  - "stripe": real Stripe Checkout + webhooks (set STRIPE_SECRET_KEY etc.)
//  - "demo":   no keys configured — checkout is simulated so the full
//              subscription flow can be exercised without charging anyone.
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const MODE = STRIPE_KEY ? "stripe" : "demo";
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY) : null;

export const PLANS = {
  monthly: {
    id: "monthly",
    label: "Monthly",
    amount: 999, // cents
    interval: "month",
    stripePrice: process.env.STRIPE_PRICE_MONTHLY || "",
  },
  yearly: {
    id: "yearly",
    label: "Yearly",
    amount: 5999,
    interval: "year",
    stripePrice: process.env.STRIPE_PRICE_YEARLY || "",
  },
};

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

function periodEnd(plan) {
  const days = plan === "yearly" ? 365 : 30;
  return new Date(Date.now() + days * 86400e3).toISOString();
}

export const billingRouter = Router();

billingRouter.get("/config", (req, res) => {
  res.json({
    mode: MODE,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    plans: Object.values(PLANS).map(({ stripePrice, ...p }) => p),
  });
});

billingRouter.post("/checkout", requireAuth, async (req, res) => {
  const { plan } = req.body || {};
  if (!PLANS[plan]) return res.status(400).json({ error: "Unknown plan." });
  if (isPremium(req.userId)) {
    return res.status(400).json({ error: "You already have an active subscription." });
  }

  if (MODE === "demo") {
    // Simulated checkout: the client shows a test-mode payment page and then
    // calls /demo-activate. No real payment happens in this mode.
    return res.json({ demo: true, plan });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PLANS[plan].stripePrice, quantity: 1 }],
      customer_email: q.userById.get(req.userId).email,
      client_reference_id: String(req.userId),
      metadata: { userId: String(req.userId), plan },
      subscription_data: { metadata: { userId: String(req.userId), plan } },
      success_url: `${CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/pricing`,
      allow_promotion_codes: true,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(502).json({ error: "Could not start checkout. Try again." });
  }
});

// Demo mode only: activate the subscription after the simulated payment page.
billingRouter.post("/demo-activate", requireAuth, (req, res) => {
  if (MODE !== "demo") {
    return res.status(400).json({ error: "Not available in live mode." });
  }
  const { plan } = req.body || {};
  if (!PLANS[plan]) return res.status(400).json({ error: "Unknown plan." });
  q.upsertSub.run(req.userId, plan, "active", "demo", null, null, periodEnd(plan));
  res.json({ user: publicUser(req.userId) });
});

// Verify a Stripe checkout session on the success page (belt-and-braces in
// case the webhook is delayed).
billingRouter.get("/verify-session", requireAuth, async (req, res) => {
  if (MODE !== "stripe") return res.json({ user: publicUser(req.userId) });
  try {
    const session = await stripe.checkout.sessions.retrieve(
      String(req.query.session_id || "")
    );
    if (
      session &&
      session.payment_status === "paid" &&
      String(session.client_reference_id) === String(req.userId)
    ) {
      const plan = session.metadata?.plan === "yearly" ? "yearly" : "monthly";
      q.upsertSub.run(
        req.userId, plan, "active", "stripe",
        String(session.customer || ""), String(session.subscription || ""),
        periodEnd(plan)
      );
    }
  } catch (err) {
    console.error("verify-session error:", err.message);
  }
  res.json({ user: publicUser(req.userId) });
});

billingRouter.post("/cancel", requireAuth, async (req, res) => {
  const sub = q.subByUser.get(req.userId);
  if (!sub || (sub.status !== "active" && sub.status !== "canceling")) {
    return res.status(400).json({ error: "No active subscription." });
  }
  if (sub.provider === "stripe" && sub.stripe_subscription_id) {
    try {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      console.error("Stripe cancel error:", err.message);
      return res.status(502).json({ error: "Could not cancel with Stripe. Try again." });
    }
  }
  q.setSubStatus.run("canceling", req.userId);
  res.json({ user: publicUser(req.userId) });
});

billingRouter.post("/resume", requireAuth, async (req, res) => {
  const sub = q.subByUser.get(req.userId);
  if (!sub || sub.status !== "canceling") {
    return res.status(400).json({ error: "Nothing to resume." });
  }
  if (sub.provider === "stripe" && sub.stripe_subscription_id) {
    try {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
    } catch (err) {
      console.error("Stripe resume error:", err.message);
      return res.status(502).json({ error: "Could not resume with Stripe. Try again." });
    }
  }
  q.setSubStatus.run("active", req.userId);
  res.json({ user: publicUser(req.userId) });
});

// Stripe webhook — mounted with express.raw() in index.js because Stripe
// signature verification needs the unparsed body.
export async function stripeWebhook(req, res) {
  if (MODE !== "stripe") return res.status(400).end();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed": {
      const userId = Number(obj.client_reference_id || obj.metadata?.userId);
      if (userId) {
        const plan = obj.metadata?.plan === "yearly" ? "yearly" : "monthly";
        q.upsertSub.run(
          userId, plan, "active", "stripe",
          String(obj.customer || ""), String(obj.subscription || ""),
          periodEnd(plan)
        );
      }
      break;
    }
    case "customer.subscription.updated": {
      const row = q.subByStripeSubId.get(String(obj.id));
      const userId = row?.user_id || Number(obj.metadata?.userId);
      if (userId) {
        const plan = obj.metadata?.plan === "yearly" ? "yearly" : "monthly";
        const status =
          obj.status === "active" || obj.status === "trialing"
            ? obj.cancel_at_period_end ? "canceling" : "active"
            : obj.status === "past_due" ? "past_due" : "canceled";
        const end = obj.current_period_end
          ? new Date(obj.current_period_end * 1000).toISOString()
          : null;
        q.upsertSub.run(userId, plan, status, "stripe",
          String(obj.customer || ""), String(obj.id), end);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const row = q.subByStripeSubId.get(String(obj.id));
      if (row) q.setSubStatus.run("canceled", row.user_id);
      break;
    }
  }
  res.json({ received: true });
}
