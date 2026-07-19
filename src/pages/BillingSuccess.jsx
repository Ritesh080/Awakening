import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PartyPopper } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { useAppState } from "../store.jsx";
import { api } from "../lib/api.js";

export default function BillingSuccess() {
  const { setUser } = useAppState();
  const [params] = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sessionId = params.get("session_id");
        const res = await api(
          `/billing/verify-session?session_id=${encodeURIComponent(sessionId || "")}`
        );
        if (res?.user) setUser(res.user);
      } catch { /* webhook will still reconcile */ }
      setVerifying(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell hideNav>
      <div className="flex flex-col items-center px-8 mt-24 text-center fade-up">
        <span className="h-20 w-20 rounded-full bg-blush flex items-center justify-center">
          <PartyPopper size={36} className="text-rosedeep" />
        </span>
        <h1 className="font-display text-3xl text-ink mt-6">Welcome to Premium</h1>
        <p className="text-sm text-inkmuted mt-3 leading-relaxed">
          {verifying
            ? "Confirming your subscription…"
            : "Everything is unlocked. Every program, every session, every soundscape."}
        </p>
        <Link
          to="/app"
          className="mt-8 w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition"
        >
          Start meditating
        </Link>
      </div>
    </AppShell>
  );
}
