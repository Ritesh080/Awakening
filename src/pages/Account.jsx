import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Flame, Timer, CircleCheckBig, LogOut, Sparkles } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { useAppState } from "../store.jsx";
import { api } from "../lib/api.js";

export default function Account() {
  const { user, setUser, logout } = useAppState();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <AppShell>
        <div className="px-8 mt-24 text-center">
          <h1 className="font-display text-2xl text-ink">Your practice, saved</h1>
          <p className="text-sm text-inkmuted mt-2">
            Create a free account to track streaks, minutes, and completed sessions.
          </p>
          <Link to="/register" className="mt-6 block w-full rounded-full bg-ink text-card py-4 font-semibold">
            Create account
          </Link>
          <Link to="/login" className="mt-3 block text-sm text-inkmuted hover:text-ink">
            I already have one
          </Link>
        </div>
      </AppShell>
    );
  }

  const sub = user.subscription;
  const cancel = async () => {
    setBusy(true); setError("");
    try {
      const res = await api("/billing/cancel", { method: "POST" });
      setUser(res.user);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };
  const resume = async () => {
    setBusy(true); setError("");
    try {
      const res = await api("/billing/resume", { method: "POST" });
      setUser(res.user);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const stats = [
    { icon: Flame, label: "Day streak", value: user.stats.streak },
    { icon: Timer, label: "Minutes", value: user.stats.minutes },
    { icon: CircleCheckBig, label: "Sessions", value: user.stats.sessions },
  ];

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">Profile</h1>
        <span className="w-6" />
      </div>

      <div className="px-6 mt-8 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[#f6dcb8] flex items-center justify-center font-display text-2xl text-ink">
          {user.name[0].toUpperCase()}
        </div>
        <div>
          <p className="font-display text-xl text-ink">{user.name}</p>
          <p className="text-xs text-inkmuted mt-0.5">{user.email}</p>
          {user.premium && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-rosedeep bg-blush rounded-full px-2.5 py-0.5">
              <Sparkles size={11} /> PREMIUM
            </span>
          )}
        </div>
      </div>

      <div className="px-6 mt-7 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-tile rounded-3xl border border-ink/5 p-4 text-center">
            <Icon size={18} className="text-rosedeep mx-auto" />
            <p className="font-display text-2xl text-ink mt-1.5">{value}</p>
            <p className="text-[11px] text-inkmuted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="px-6 mt-7">
        <h2 className="font-display text-lg text-ink">Subscription</h2>
        <div className="mt-3 bg-tile rounded-3xl border border-ink/5 p-5">
          {user.premium ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">
                    Premium — {sub?.plan === "yearly" ? "Yearly" : "Monthly"}
                  </p>
                  <p className="text-xs text-inkmuted mt-1">
                    {sub?.status === "canceling"
                      ? `Cancels ${sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "at period end"}`
                      : `Renews ${sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "automatically"}`}
                    {sub?.provider === "demo" && " · test mode"}
                  </p>
                </div>
                <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${
                  sub?.status === "canceling" ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/15 text-emerald-300"
                }`}>
                  {sub?.status === "canceling" ? "ENDING" : "ACTIVE"}
                </span>
              </div>
              {error && <p className="text-sm text-rosedeep mt-3">{error}</p>}
              {sub?.status === "canceling" ? (
                <button onClick={resume} disabled={busy}
                  className="mt-4 w-full rounded-full bg-ink text-card py-3 text-sm font-semibold disabled:opacity-60">
                  {busy ? "…" : "Resume subscription"}
                </button>
              ) : (
                <button onClick={cancel} disabled={busy}
                  className="mt-4 w-full rounded-full border border-ink/15 text-ink py-3 text-sm font-semibold hover:bg-cardsoft disabled:opacity-60">
                  {busy ? "…" : "Cancel subscription"}
                </button>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">Free plan</p>
              <p className="text-xs text-inkmuted mt-1">
                Free steps in every program. Upgrade for the full library.
              </p>
              <Link to="/pricing"
                className="mt-4 block text-center w-full rounded-full bg-ink text-card py-3 text-sm font-semibold">
                Upgrade to Premium
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="px-6 mt-6 pb-8">
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="flex items-center justify-center gap-2 w-full rounded-full border border-ink/15 text-inkmuted py-3 text-sm font-semibold hover:text-ink hover:bg-cardsoft"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </AppShell>
  );
}
