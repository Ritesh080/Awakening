import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, Sparkles, ShieldCheck } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { useAppState } from "../store.jsx";
import { api } from "../lib/api.js";

const PERKS = [
  "All programs & sessions unlocked",
  "Remedy — type your problem, get a practice prescription",
  "Funmaxxing — daily joy quests & fun points",
  "Sleep stories & focus soundscapes",
  "New guided sessions every month",
  "Cancel anytime — keep access till period end",
];

export default function Pricing() {
  const { user, billing, isPremium } = useAppState();
  const navigate = useNavigate();
  const [plan, setPlan] = useState("yearly");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const plans = billing?.plans || [
    { id: "monthly", label: "Monthly", amount: 999, interval: "month" },
    { id: "yearly", label: "Yearly", amount: 5999, interval: "year" },
  ];
  const demoMode = billing?.mode === "demo";

  const checkout = async () => {
    if (!user) {
      navigate(`/register?next=/pricing`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await api("/billing/checkout", { method: "POST", body: { plan } });
      if (res.demo) {
        navigate(`/checkout?plan=${plan}`);
      } else if (res.url) {
        window.location.href = res.url; // Stripe-hosted checkout
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">Premium</h1>
        <span className="w-6" />
      </div>

      <div className="px-8 mt-8 text-center">
        <span className="inline-flex h-14 w-14 rounded-2xl bg-blush items-center justify-center">
          <Sparkles className="text-rosedeep" size={26} />
        </span>
        <h2 className="font-display text-3xl text-ink mt-4">Awakening Premium</h2>
        <p className="text-sm text-inkmuted mt-2">
          The full library, for less than one coffee a month.
        </p>
      </div>

      {isPremium ? (
        <div className="mx-6 mt-8 bg-lavender rounded-4xl p-6 text-center">
          <p className="font-semibold text-ink">You're already Premium ✨</p>
          <p className="text-sm text-inkmuted mt-1.5">
            Manage your subscription from your profile.
          </p>
          <button
            onClick={() => navigate("/app/account")}
            className="mt-4 rounded-full bg-ink text-card px-6 py-3 text-sm font-semibold"
          >
            Go to profile
          </button>
        </div>
      ) : (
        <>
          <div className="px-6 mt-8 space-y-3">
            {plans.map((p) => {
              const perMonth = p.id === "yearly" ? p.amount / 100 / 12 : p.amount / 100;
              const active = plan === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`w-full text-left rounded-3xl p-5 border-2 transition relative ${
                    active ? "border-ink bg-tile shadow-soft" : "border-ink/10 bg-tile/70"
                  }`}
                >
                  {p.id === "yearly" && (
                    <span className="absolute -top-2.5 right-5 bg-rosedeep text-white text-[11px] font-bold rounded-full px-3 py-0.5">
                      SAVE 50%
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-ink">{p.label}</p>
                      <p className="text-xs text-inkmuted mt-0.5">
                        ${(p.amount / 100).toFixed(2)} billed every {p.interval}
                      </p>
                    </div>
                    <p className="font-display text-xl text-ink">
                      ${perMonth.toFixed(2)}
                      <span className="text-xs text-inkmuted font-sans">/mo</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <ul className="px-8 mt-6 space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-ink">
                <span className="h-5 w-5 rounded-full bg-blush flex items-center justify-center shrink-0">
                  <Check size={12} className="text-rosedeep" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="px-6 mt-7 pb-6">
            {error && <p className="text-sm text-rosedeep mb-3 text-center">{error}</p>}
            <button
              onClick={checkout}
              disabled={busy}
              className="w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition disabled:opacity-60"
            >
              {busy ? "Starting checkout…" : user ? "Continue to payment" : "Create account & subscribe"}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-inkmuted mt-3">
              <ShieldCheck size={13} />
              {demoMode
                ? "Test mode — no real charges until Stripe keys are configured"
                : "Secure payment via Stripe · Cancel anytime"}
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
}
