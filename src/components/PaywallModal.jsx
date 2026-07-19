import { useNavigate } from "react-router-dom";
import { X, Sparkles, Check } from "lucide-react";
import { useAppState } from "../store.jsx";

export default function PaywallModal() {
  const { paywallOpen, setPaywallOpen, user, billing } = useAppState();
  const navigate = useNavigate();
  if (!paywallOpen) return null;

  const go = (path) => {
    setPaywallOpen(false);
    navigate(path);
  };

  const perks = [
    "Every program & session unlocked",
    "Remedy — personal practice prescriptions",
    "Funmaxxing — daily joy quests",
    "Sleep & focus soundscapes",
  ];

  const yearly = billing?.plans?.find((p) => p.id === "yearly");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-sm p-0 sm:p-6">
      <div className="bg-card w-full sm:max-w-md rounded-t-4xl sm:rounded-4xl p-8 fade-up shadow-card">
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-2xl bg-blush flex items-center justify-center">
            <Sparkles className="text-rosedeep" size={24} />
          </div>
          <button
            aria-label="Close"
            onClick={() => setPaywallOpen(false)}
            className="text-inkmuted hover:text-ink p-1"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="font-display text-2xl text-ink mt-5">
          You've reached the free part of this session
        </h2>
        <p className="text-inkmuted mt-2 text-sm leading-relaxed">
          Unlock the full library with Awakening&nbsp;Premium — from{" "}
          {yearly ? `$${(yearly.amount / 100 / 12).toFixed(2)}/mo billed yearly` : "$4.99/mo"}.
        </p>

        <ul className="mt-5 space-y-2.5">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm text-ink">
              <span className="h-5 w-5 rounded-full bg-blush flex items-center justify-center shrink-0">
                <Check size={12} className="text-rosedeep" strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>

        <button
          onClick={() => go(user ? "/pricing" : "/register?next=/pricing")}
          className="mt-7 w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition"
        >
          {user ? "See plans" : "Create a free account"}
        </button>
        <button
          onClick={() => setPaywallOpen(false)}
          className="mt-3 w-full text-sm text-inkmuted hover:text-ink py-1"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
