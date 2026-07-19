import { Link } from "react-router-dom";
import { Play, Sparkles, Moon, Wind, BarChart3, Check } from "lucide-react";
import Illustration from "../components/Illustrations.jsx";
import { useAppState } from "../store.jsx";

export default function Landing() {
  const { user, billing } = useAppState();
  const yearly = billing?.plans?.find((p) => p.id === "yearly");
  const monthly = billing?.plans?.find((p) => p.id === "monthly");

  return (
    <div className="min-h-screen bg-haze text-ink">
      {/* Nav */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-xl font-semibold">awakening</Link>
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link to="/pricing" className="text-ink/70 hover:text-ink hidden sm:block">Pricing</Link>
          {user ? (
            <Link to="/app" className="bg-ink text-card rounded-full px-5 py-2.5">Open app</Link>
          ) : (
            <>
              <Link to="/login" className="text-ink/70 hover:text-ink">Sign in</Link>
              <Link to="/register" className="bg-ink text-card rounded-full px-5 py-2.5">
                Start free
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-wide bg-white/10 rounded-full px-4 py-2">
            <Sparkles size={13} className="text-rosedeep" /> GUIDED MEDITATION, MADE SIMPLE
          </p>
          <h1 className="font-display text-5xl sm:text-6xl leading-[1.08] mt-6">
            Find your still point in a loud world.
          </h1>
          <p className="text-ink/60 text-lg mt-5 max-w-md leading-relaxed">
            Ten-minute guided sessions for calm, sleep, anxiety and focus —
            with a voice and soundscape that meet you where you are.
          </p>
          <div className="flex items-center gap-4 mt-8">
            <Link
              to={user ? "/app" : "/register"}
              className="bg-ink text-card rounded-full px-7 py-4 font-semibold hover:bg-ink/90 transition"
            >
              {user ? "Open the app" : "Start meditating free"}
            </Link>
            <Link to="/pricing" className="font-semibold text-ink/70 hover:text-ink">
              See pricing →
            </Link>
          </div>
          <p className="text-xs text-ink/50 mt-4">
            Free to start · No card required · Cancel anytime
          </p>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center">
          <div className="w-[320px] bg-card rounded-[2.8rem] shadow-card p-6 relative">
            <p className="text-xs text-inkmuted mt-2">Welcome back!</p>
            <p className="font-display text-2xl leading-snug mt-1">
              How are you feeling today?
            </p>
            <div className="flex gap-2 mt-4 text-xs">
              <span className="bg-tile shadow-soft rounded-full px-4 py-1.5 font-semibold">Calm</span>
              <span className="text-inkmuted px-2 py-1.5">Sleep</span>
              <span className="text-inkmuted px-2 py-1.5">Anxiety</span>
              <span className="text-inkmuted px-2 py-1.5">Music</span>
            </div>
            <div className="bg-lavender rounded-3xl p-5 mt-4 relative overflow-hidden">
              <p className="font-display text-sm leading-snug max-w-[60%]">
                A 10–minute session for today's mood
              </p>
              <span className="inline-flex items-center gap-1.5 bg-blush rounded-full px-3 py-1.5 text-xs font-semibold mt-3">
                <Play size={9} className="fill-ink" /> Start
              </span>
              <div className="absolute -right-2 -bottom-3 w-24 h-24">
                <Illustration name="lotus" className="w-full h-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {["swing", "skate"].map((n, i) => (
                <div key={n} className="bg-tile rounded-2xl border border-ink/5 p-3">
                  <div className="h-16"><Illustration name={n} className="w-full h-full" /></div>
                  <p className="font-display text-xs mt-1">{i === 0 ? "Energize" : "Wake Up"}</p>
                </div>
              ))}
            </div>
            {/* floating orb */}
            <div className="absolute -right-10 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blush via-rose to-rosedeep shadow-orb orb-breathe" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-4xl text-center">Built around how you actually feel</h2>
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Wind, title: "Mood-first sessions", text: "Pick Calm, Sleep, Anxiety or Music — get a session tuned to right now, not a 30-day curriculum you'll abandon." },
              { icon: Moon, title: "Real soundscapes", text: "Breathing orb, generative ambient audio, and gentle chimes carry you through every step of a session." },
              { icon: BarChart3, title: "Progress that sticks", text: "Streaks, minutes and completed sessions sync to your account — quiet accountability, no guilt-tripping." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-cardsoft rounded-4xl p-8">
                <span className="h-12 w-12 rounded-2xl bg-blush flex items-center justify-center">
                  <Icon size={22} className="text-rosedeep" />
                </span>
                <h3 className="font-display text-xl mt-5">{title}</h3>
                <p className="text-sm text-inkmuted mt-2.5 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing teaser */}
        <div className="max-w-3xl mx-auto px-6 pb-24 text-center">
          <h2 className="font-display text-4xl">Start free. Upgrade when it clicks.</h2>
          <p className="text-inkmuted mt-3">
            Free steps in every program, forever. Premium unlocks the whole library
            {monthly ? ` from $${(monthly.amount / 100).toFixed(2)}/mo` : ""}
            {yearly ? ` — or $${(yearly.amount / 100 / 12).toFixed(2)}/mo billed yearly.` : "."}
          </p>
          <ul className="inline-flex flex-col items-start gap-2 mt-6 text-sm">
            {["All programs & soundscapes", "New sessions monthly", "Cancel anytime"].map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check size={15} className="text-rosedeep" strokeWidth={3} /> {p}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link to="/pricing" className="bg-ink text-card rounded-full px-8 py-4 font-semibold hover:bg-ink/90 transition">
              View plans
            </Link>
          </div>
        </div>

        <footer className="border-t border-ink/10">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-inkmuted">
            <p className="font-display text-sm text-ink">awakening</p>
            <p>Not medical advice. If you're struggling, please reach out to a professional.</p>
            <p>© {new Date().getFullYear()} Awakening</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
