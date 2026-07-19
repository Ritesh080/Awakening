import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { authRouter, requireAuth, publicUser } from "./auth.js";
import { billingRouter, stripeWebhook } from "./billing.js";
import { q } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

// Stripe webhook must receive the raw body, so mount it before express.json.
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/billing", billingRouter);

app.post("/api/progress/complete", requireAuth, (req, res) => {
  const { programId, seconds } = req.body || {};
  if (!programId || typeof seconds !== "number" || seconds < 0 || seconds > 7200) {
    return res.status(400).json({ error: "Invalid session data." });
  }
  q.addCompletion.run(req.userId, String(programId), Math.round(seconds));
  res.json({ user: publicUser(req.userId) });
});

app.get("/api/progress/recent", requireAuth, (req, res) => {
  res.json({ recent: q.recentCompletions.all(req.userId) });
});

// Full breakdown for the Journey page: per-program totals + distinct
// practice days. Category mapping happens client-side where the content
// catalog lives.
app.get("/api/progress/summary", requireAuth, (req, res) => {
  const user = publicUser(req.userId);
  res.json({
    stats: user.stats,
    days: q.distinctDays.get(req.userId).days,
    byProgram: q.byProgram.all(req.userId),
  });
});

// Per-user key-value settings (intention, avatar config, funmax stats, …)
const SETTING_KEYS = new Set(["intention", "avatar", "funmax"]);

app.get("/api/settings", requireAuth, (req, res) => {
  const settings = {};
  for (const row of q.allSettings.all(req.userId)) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch { /* skip corrupt rows */ }
  }
  res.json({ settings });
});

app.put("/api/settings/:key", requireAuth, (req, res) => {
  const { key } = req.params;
  if (!SETTING_KEYS.has(key)) {
    return res.status(400).json({ error: "Unknown setting." });
  }
  const value = JSON.stringify(req.body?.value ?? null);
  if (value.length > 8000) {
    return res.status(400).json({ error: "Setting too large." });
  }
  q.upsertSetting.run(req.userId, key, value);
  res.json({ ok: true });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

// In production, serve the built frontend from dist/.
const dist = path.join(__dirname, "..", "dist");
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Awakening API listening on http://localhost:${PORT}`);
  console.log(`Billing mode: ${process.env.STRIPE_SECRET_KEY ? "stripe (live keys)" : "demo (test mode — set STRIPE_SECRET_KEY to go live)"}`);
});
