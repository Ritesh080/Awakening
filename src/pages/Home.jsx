import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Sparkles, Stethoscope, PartyPopper, Lock, ChevronRight } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell.jsx";
import Illustration from "../components/Illustrations.jsx";
import { CATEGORIES, byCategory, featuredProgram } from "../data/programs.js";
import { auraStyle } from "../lib/theme.js";
import { useAppState } from "../store.jsx";

export default function Home() {
  const { user, settings, isPremium } = useAppState();
  const [category, setCategory] = useState("calm");
  const featured = featuredProgram;
  const recs = byCategory(category).filter((p) => p.id !== featured.id);
  const intention = settings.intention;

  return (
    <AppShell>
      <TopBar />

      <div className="px-6 mt-6">
        <p className="text-sm text-inkmuted">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}!
        </p>
        <h1 className="font-display text-[32px] leading-[1.15] text-ink mt-1.5">
          How are you feeling<br />today?
        </h1>
      </div>

      {/* Mood tabs */}
      <div className="flex items-center gap-2 px-6 mt-6 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition ${
              category === c.id
                ? "bg-tile text-ink font-semibold shadow-soft"
                : "text-inkmuted hover:text-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Featured card */}
      <div className="px-6 mt-5">
        <Link
          to={`/app/program/${featured.id}`}
          className="block bg-lavender rounded-4xl p-6 relative overflow-hidden hover:shadow-soft transition"
        >
          <span className="aura -right-6 -bottom-10" style={auraStyle("affirmations", 220, 0.5)} />
          <span className="aura -left-10 -top-12" style={auraStyle("gateway", 180, 0.35)} />
          <div className="max-w-[55%] relative">
            <h2 className="font-display text-xl leading-snug text-ink">
              A 10–minute session for today's mood
            </h2>
            <p className="text-xs text-inkmuted mt-2">{featured.sessions} Sessions</p>
            <span className="inline-flex items-center gap-2 bg-blush text-ink text-sm font-semibold rounded-full pl-3 pr-4 py-2 mt-4">
              <span className="h-5 w-5 rounded-full bg-ink flex items-center justify-center">
                <Play size={10} className="text-blush fill-blush ml-0.5" />
              </span>
              Start
            </span>
          </div>
          <div className="absolute right-2 bottom-0 w-40 h-40">
            <Illustration name="lotus" className="w-full h-full" />
          </div>
        </Link>
      </div>

      {/* Awakening intention */}
      {user && (
        <div className="px-6 mt-4">
          <Link to="/app/intention"
            className="flex items-center gap-3 bg-tile rounded-3xl border border-ink/5 px-4 py-3.5 hover:shadow-soft transition">
            <span className="h-9 w-9 rounded-full bg-blush flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-rosedeep" />
            </span>
            <div className="flex-1 min-w-0">
              {intention ? (
                <>
                  <p className="text-[11px] text-inkmuted">You are awakening</p>
                  <p className="text-sm font-semibold text-ink truncate">“{intention.text}”</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-ink">What do you want to awaken?</p>
                  <p className="text-[11px] text-inkmuted">Set your intention — we'll match your path</p>
                </>
              )}
            </div>
            <ChevronRight size={16} className="text-inkmuted shrink-0" />
          </Link>
        </div>
      )}

      {/* Premium tools */}
      <div className="px-6 mt-4 grid grid-cols-2 gap-3">
        <Link to="/app/remedy"
          className="bg-tile rounded-3xl border border-ink/5 p-4 hover:shadow-soft transition relative">
          {!isPremium && <Lock size={12} className="absolute top-3.5 right-3.5 text-inkmuted" />}
          <Stethoscope size={18} className="text-rosedeep" />
          <p className="font-display text-[15px] text-ink mt-2">Remedy</p>
          <p className="text-[11px] text-inkmuted mt-0.5">Type your problem, get a practice</p>
        </Link>
        <Link to="/app/funmax"
          className="bg-tile rounded-3xl border border-ink/5 p-4 hover:shadow-soft transition relative">
          {!isPremium && <Lock size={12} className="absolute top-3.5 right-3.5 text-inkmuted" />}
          <PartyPopper size={18} className="text-rosedeep" />
          <p className="font-display text-[15px] text-ink mt-2">Funmaxxing</p>
          <p className="text-[11px] text-inkmuted mt-0.5">Daily joy quests & fun points</p>
        </Link>
      </div>

      {/* Recommendations */}
      <div className="px-6 mt-7">
        <h3 className="font-display text-lg text-ink">Recommendation</h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {recs.map((p) => (
            <Link
              key={p.id}
              to={`/app/program/${p.id}`}
              className="bg-tile rounded-3xl p-4 border border-ink/5 hover:shadow-soft transition relative overflow-hidden"
            >
              <span className="aura -right-8 -top-10" style={auraStyle(p.category, 150, 0.4)} />
              <div className="h-28 -mt-1 relative">
                <Illustration name={p.illustration} className="w-full h-full" />
              </div>
              <p className="font-display text-[15px] text-ink mt-2">{p.title}</p>
              <p className="flex items-center gap-1.5 text-xs text-inkmuted mt-1.5">
                <span className="h-4 w-4 rounded-full bg-ink flex items-center justify-center">
                  <Play size={8} className="text-white fill-white ml-px" />
                </span>
                {p.sessions} Sessions
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
