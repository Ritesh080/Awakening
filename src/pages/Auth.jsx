import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { useAppState } from "../store.jsx";

function AuthFrame({ title, subtitle, children }) {
  const navigate = useNavigate();
  return (
    <AppShell hideNav>
      <div className="px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
      </div>
      <div className="px-8 mt-8">
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        <p className="text-sm text-inkmuted mt-2">{subtitle}</p>
        {children}
      </div>
    </AppShell>
  );
}

const inputCls =
  "w-full rounded-2xl border border-ink/10 bg-tile px-4 py-3.5 text-sm text-ink placeholder-inkmuted focus:outline-none focus:ring-2 focus:ring-rose";

export function Login() {
  const { login } = useAppState();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate(params.get("next") || "/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to continue your practice.">
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input className={inputCls} type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input className={inputCls} type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        {error && <p className="text-sm text-rosedeep">{error}</p>}
        <button disabled={busy}
          className="w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-inkmuted mt-6 text-center">
        New to Awakening?{" "}
        <Link to={`/register${location.search}`} className="text-ink font-semibold underline">
          Create an account
        </Link>
      </p>
    </AuthFrame>
  );
}

export function Register() {
  const { register } = useAppState();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(name, email, password);
      navigate(params.get("next") || "/app/intention?welcome=1");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      title="Create your account"
      subtitle="Free to join. Three free steps in every session — upgrade whenever you're ready."
    >
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input className={inputCls} placeholder="Your name" value={name}
          onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        <input className={inputCls} type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input className={inputCls} type="password" placeholder="Password (8+ characters)" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        {error && <p className="text-sm text-rosedeep">{error}</p>}
        <button disabled={busy}
          className="w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition disabled:opacity-60">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-inkmuted mt-6 text-center">
        Already have an account?{" "}
        <Link to={`/login${location.search}`} className="text-ink font-semibold underline">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
