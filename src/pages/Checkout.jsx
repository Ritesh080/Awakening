import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ChevronLeft, Lock, CreditCard } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { useAppState } from "../store.jsx";
import { api } from "../lib/api.js";

// Demo-mode checkout page. Shown only when the server has no Stripe keys —
// it simulates the payment step so the whole subscription flow can be
// exercised end-to-end. With live keys, users go to Stripe-hosted Checkout
// instead and never see this page.
export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { billing, setUser, user } = useAppState();
  const plan = params.get("plan") === "monthly" ? "monthly" : "yearly";
  const planInfo = billing?.plans?.find((p) => p.id === plan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <AppShell hideNav>
        <div className="p-10 text-center">
          <p className="text-inkmuted">Sign in to subscribe.</p>
          <Link to="/login?next=/pricing" className="text-ink font-semibold underline">
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  const pay = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api("/billing/demo-activate", { method: "POST", body: { plan } });
      setUser(res.user);
      navigate("/billing/success");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AppShell hideNav>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">Checkout</h1>
        <span className="w-6" />
      </div>

      <div className="mx-6 mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-xs text-amber-200 font-medium">
        TEST MODE — this is a simulated payment. No card is charged. Add Stripe
        keys to .env to enable real payments.
      </div>

      <div className="mx-6 mt-5 bg-tile rounded-3xl border border-ink/5 p-5">
        <p className="text-sm text-inkmuted">Awakening Premium — {planInfo?.label || plan}</p>
        <p className="font-display text-3xl text-ink mt-1">
          ${planInfo ? (planInfo.amount / 100).toFixed(2) : "—"}
          <span className="text-sm font-sans text-inkmuted"> / {planInfo?.interval}</span>
        </p>
      </div>

      <form onSubmit={pay} className="px-6 mt-5 space-y-3">
        <div className="relative">
          <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input
            className="w-full rounded-2xl border border-ink/10 bg-tile pl-11 pr-4 py-3.5 text-sm"
            placeholder="4242 4242 4242 4242"
            defaultValue="4242 4242 4242 4242"
            readOnly
          />
        </div>
        <div className="flex gap-3">
          <input className="w-1/2 rounded-2xl border border-ink/10 bg-tile px-4 py-3.5 text-sm"
            placeholder="MM / YY" defaultValue="12 / 29" readOnly />
          <input className="w-1/2 rounded-2xl border border-ink/10 bg-tile px-4 py-3.5 text-sm"
            placeholder="CVC" defaultValue="424" readOnly />
        </div>
        {error && <p className="text-sm text-rosedeep">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition disabled:opacity-60"
        >
          {busy ? "Processing…" : "Complete test payment"}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-inkmuted pt-1 pb-8">
          <Lock size={12} /> Simulated checkout — replaced by Stripe in live mode
        </p>
      </form>
    </AppShell>
  );
}
