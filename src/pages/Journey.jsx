import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Flame, Timer, CircleCheckBig, CalendarDays, User, Activity } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { PersonalAvatar, DEFAULT_AVATAR } from "../components/Avatar.jsx";
import { programs } from "../data/programs.js";
import { useAppState } from "../store.jsx";
import { api } from "../lib/api.js";

// Practice levels — the avatar and summit milestone key off total minutes.
const LEVELS = [
  { min: 0, title: "First Steps" },
  { min: 30, title: "Settling In" },
  { min: 90, title: "Steady Mind" },
  { min: 200, title: "Deep Practice" },
  { min: 400, title: "Peak State" },
];
const levelFor = (minutes) =>
  LEVELS.reduce((acc, l, i) => (minutes >= l.min ? i : acc), 0);

// Inner systems — meditation categories mapped to body systems.
const SYSTEMS = [
  { id: "mind", label: "Mind", sub: "Gateway & guided", cats: ["gateway", "guided"], cy: 64 },
  { id: "heart", label: "Heart", sub: "Belief & affirmations", cats: ["selfbelief", "affirmations"], cy: 150 },
  { id: "breath", label: "Breath", sub: "Calm & manifestation", cats: ["calm", "manifestation"], cy: 196 },
  { id: "nerves", label: "Nerves", sub: "Anxiety relief", cats: ["anxiety"], cy: 244 },
  { id: "rest", label: "Rest", sub: "Sleep & sound", cats: ["sleep", "music"], cy: 272 },
];

function systemLevel(minutes) {
  if (minutes >= 60) return { label: "High", cls: "bg-cyan-400/15 text-cyan-300" };
  if (minutes >= 20) return { label: "Rising", cls: "bg-amber-400/15 text-amber-300" };
  if (minutes > 0) return { label: "Low", cls: "bg-white/10 text-white/60" };
  return { label: "Awaiting", cls: "bg-white/5 text-white/35" };
}

const MILESTONES = (s) => [
  { label: "First session", detail: "You showed up", hit: s.sessions >= 1 },
  { label: "3 days practiced", detail: "It's becoming a habit", hit: s.days >= 3 },
  { label: "30 minutes", detail: "Half an hour of stillness", hit: s.minutes >= 30 },
  { label: "10 sessions", detail: "Double digits", hit: s.sessions >= 10 },
  { label: "7 days practiced", detail: "A full week of you", hit: s.days >= 7 },
  { label: "150 minutes", detail: "Deep practice territory", hit: s.minutes >= 150 },
  { label: "Peak State", detail: "The summit", hit: s.minutes >= 400 && s.sessions >= 25 },
];

export default function Journey() {
  const { user, settings } = useAppState();
  const navigate = useNavigate();
  const [view, setView] = useState("avatar"); // 'avatar' | 'inner'
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!user) return;
    api("/progress/summary").then(setSummary).catch(() => {});
  }, [user]);

  const systems = useMemo(() => {
    const catMinutes = {};
    (summary?.byProgram || []).forEach((row) => {
      const prog = programs.find((p) => p.id === row.program_id);
      if (!prog) return;
      catMinutes[prog.category] = (catMinutes[prog.category] || 0) + row.seconds / 60;
    });
    return SYSTEMS.map((sys) => ({
      ...sys,
      minutes: Math.round(sys.cats.reduce((sum, c) => sum + (catMinutes[c] || 0), 0)),
    }));
  }, [summary]);

  if (!user) {
    return (
      <AppShell>
        <div className="px-8 mt-24 text-center">
          <h1 className="font-display text-2xl text-ink">Your journey, visualized</h1>
          <p className="text-sm text-inkmuted mt-2">
            Create a free account and every session you finish moves you up the mountain.
          </p>
          <Link to="/register" className="mt-6 block w-full rounded-full bg-ink text-card py-4 font-semibold">
            Create account
          </Link>
        </div>
      </AppShell>
    );
  }

  const stats = {
    sessions: summary?.stats?.sessions ?? user.stats.sessions,
    minutes: summary?.stats?.minutes ?? user.stats.minutes,
    streak: summary?.stats?.streak ?? user.stats.streak,
    days: summary?.days ?? 0,
  };
  const level = levelFor(stats.minutes);

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">Journey</h1>
        {/* View toggle, echoing the two-lens control in the reference */}
        <div className="flex items-center gap-1 bg-tile rounded-full p-1 shadow-soft">
          <button
            aria-label="Avatar view"
            onClick={() => setView("avatar")}
            className={`h-7 w-7 rounded-full flex items-center justify-center transition ${
              view === "avatar" ? "bg-ink text-card" : "text-inkmuted"
            }`}
          >
            <User size={14} />
          </button>
          <button
            aria-label="Inner view"
            onClick={() => setView("inner")}
            className={`h-7 w-7 rounded-full flex items-center justify-center transition ${
              view === "inner" ? "bg-ink text-card" : "text-inkmuted"
            }`}
          >
            <Activity size={14} />
          </button>
        </div>
      </div>

      {view === "avatar" ? (
        <AvatarView stats={stats} level={level} name={user.name} config={settings.avatar || DEFAULT_AVATAR} />
      ) : (
        <InnerView systems={systems} />
      )}

      <AscentMountain stats={stats} />
      <div className="h-8" />
    </AppShell>
  );
}

/* ---------- Outer progress: evolving avatar with stat cards ---------- */

function AvatarView({ stats, level, name, config }) {
  const cards = [
    { icon: CircleCheckBig, label: "Sessions", value: stats.sessions, pos: "left-0 top-2" },
    { icon: Timer, label: "Minutes", value: stats.minutes, pos: "right-0 top-2" },
    { icon: Flame, label: "Day streak", value: stats.streak, pos: "left-0 bottom-2" },
    { icon: CalendarDays, label: "Days practiced", value: stats.days, pos: "right-0 bottom-2" },
  ];
  return (
    <div className="px-6 mt-5 fade-up">
      <div className="bg-lavender rounded-4xl p-5 relative overflow-hidden">
        <span className="aura -left-10 -top-12" style={{ width: 200, height: 200, opacity: 0.4, background: "radial-gradient(circle at 40% 35%, #c084fc, #581c87 70%, transparent)" }} />
        <span className="aura -right-12 -bottom-14" style={{ width: 220, height: 220, opacity: 0.4, background: "radial-gradient(circle at 40% 35%, #ff6ab0, #831843 70%, transparent)" }} />
        <p className="text-center text-xs text-inkmuted relative">
          {name.split(" ")[0]}'s practice
        </p>
        <p className="text-center font-display text-xl text-ink mt-0.5">
          {LEVELS[level].title}
        </p>
        {/* level dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {LEVELS.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i <= level ? "w-5 bg-rosedeep" : "w-1.5 bg-ink/15"}`} />
          ))}
        </div>

        <div className="relative h-72 mt-2">
          <PersonalAvatar config={config} level={level} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64" />
          {cards.map(({ icon: Icon, label, value, pos }) => (
            <div key={label} className={`absolute ${pos} bg-tile/90 backdrop-blur rounded-2xl px-3.5 py-2.5 shadow-soft`}>
              <Icon size={14} className="text-rosedeep" />
              <p className="font-dot font-bold text-2xl text-ink mt-0.5 leading-none">{value}</p>
              <p className="text-[10px] text-inkmuted mt-1">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-inkmuted">
          {level < LEVELS.length - 1
            ? `${LEVELS[level + 1].min - stats.minutes} min to ${LEVELS[level + 1].title}`
            : "You've reached the summit level — keep the streak alive"}
        </p>
        <Link to="/app/avatar"
          className="mx-auto mt-3 mb-1 flex items-center justify-center gap-1.5 w-max text-xs font-semibold text-ink bg-tile rounded-full px-4 py-2 shadow-soft">
          <User size={12} /> Customize avatar
        </Link>
      </div>
    </div>
  );
}

/* ---------- Inner progress: systems view on a dark panel ---------- */

function InnerView({ systems }) {
  const left = systems.filter((_, i) => i % 2 === 0);
  const right = systems.filter((_, i) => i % 2 === 1);
  return (
    <div className="px-6 mt-5 fade-up">
      <div className="rounded-4xl p-5 relative overflow-hidden bg-gradient-to-b from-[#13223c] to-[#0b1424]">
        <p className="text-center text-xs text-white/50">Inner systems</p>
        <p className="text-center font-display text-xl text-white mt-0.5">
          Where your practice is landing
        </p>

        <div className="relative mt-4 flex justify-center">
          <InnerFigure systems={systems} className="h-80 w-40" />
          <div className="absolute inset-y-0 left-0 flex flex-col justify-around py-2">
            {left.map((s) => <SystemCard key={s.id} sys={s} />)}
          </div>
          <div className="absolute inset-y-0 right-0 flex flex-col justify-around py-2 items-end">
            {right.map((s) => <SystemCard key={s.id} sys={s} />)}
          </div>
        </div>

        <p className="text-center text-[11px] text-white/40 mt-4 pb-1">
          Minutes per system, from the categories you practice
        </p>
      </div>
    </div>
  );
}

function SystemCard({ sys }) {
  const lvl = systemLevel(sys.minutes);
  return (
    <div className="bg-white/[0.07] backdrop-blur border border-white/10 rounded-2xl px-3 py-2.5 w-[104px]">
      <p className="text-[11px] font-semibold text-white/85">{sys.label}</p>
      <p className="font-dot font-bold text-lg text-white leading-tight">
        {sys.minutes}<span className="text-[10px] text-white/45 font-sans"> min</span>
      </p>
      <span className={`inline-block text-[9px] font-bold rounded-full px-2 py-0.5 mt-1 ${lvl.cls}`}>
        {lvl.label}
      </span>
    </div>
  );
}

function InnerFigure({ systems, className }) {
  // Energy-body figure: outline + spine + one glowing node per system.
  const glow = (m) => (m >= 60 ? 1 : m >= 20 ? 0.65 : m > 0 ? 0.35 : 0.12);
  return (
    <svg viewBox="0 0 160 340" className={className}>
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="#7dd3fc" strokeOpacity="0.5" strokeWidth="2" fill="rgba(125,211,252,0.06)" strokeLinecap="round">
        <circle cx="80" cy="52" r="22" />
        <path d="M80 74v14M60 92c6-4 34-4 40 0l14 66-12 4-10-46v56l10 92h-14l-8-76-8 76H58l10-92v-56l-10 46-12-4 14-66z" />
      </g>
      <line x1="80" y1="86" x2="80" y2="200" stroke="#7dd3fc" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="2 6" />
      {systems.map((s) => (
        <g key={s.id}>
          <circle cx="80" cy={s.cy} r="16" fill="url(#nodeGlow)" opacity={glow(s.minutes)} />
          <circle cx="80" cy={s.cy} r="4" fill="#bae6fd" opacity={Math.max(0.25, glow(s.minutes))} />
        </g>
      ))}
    </svg>
  );
}

/* ---------- Your Ascent: milestone mountain ---------- */

// Points along the winding path, bottom → summit (viewBox 360x520).
const PATH_POINTS = [
  { x: 150, y: 470 },
  { x: 235, y: 420 },
  { x: 120, y: 365 },
  { x: 225, y: 305 },
  { x: 130, y: 248 },
  { x: 215, y: 190 },
  { x: 180, y: 118 },
];

function AscentMountain({ stats }) {
  const milestones = MILESTONES(stats);
  const reached = milestones.filter((m) => m.hit).length;
  const hereIdx = Math.max(0, reached - 1);

  return (
    <div className="px-6 mt-6">
      <div className="rounded-4xl overflow-hidden relative">
        <svg viewBox="0 0 360 520" className="w-full block">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#12122b" />
              <stop offset="100%" stopColor="#0a0a14" />
            </linearGradient>
            <linearGradient id="mtn" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f4f48" />
              <stop offset="45%" stopColor="#27306b" />
              <stop offset="100%" stopColor="#3b1a63" />
            </linearGradient>
            <linearGradient id="trail" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d9ff4f" stopOpacity="0.75" />
            </linearGradient>
            <radialGradient id="summit" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d9ff4f" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d9ff4f" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="360" height="520" fill="url(#sky)" />
          {/* summit glow */}
          <circle cx="180" cy="96" r="40" fill="url(#summit)" />
          <circle cx="180" cy="96" r="12" fill="#eaff9e" />
          {/* mountain */}
          <path d="M180 84 C 240 150, 320 260, 360 520 L 0 520 C 40 260, 120 150, 180 84 Z" fill="url(#mtn)" />
          {/* winding trail through the milestone points */}
          <path
            d="M150 520 C 200 490, 260 445, 235 420 C 210 395, 130 395, 120 365 C 110 335, 245 335, 225 305 C 205 275, 140 278, 130 248 C 120 218, 235 220, 215 190 C 198 165, 165 150, 180 118 L 180 100"
            fill="none" stroke="url(#trail)" strokeWidth="26" strokeLinecap="round" opacity="0.85"
          />
          {/* milestone nodes */}
          {milestones.map((m, i) => {
            const p = PATH_POINTS[i];
            return (
              <g key={m.label}>
                <circle cx={p.x} cy={p.y} r="13" fill={m.hit ? "#ff4fa3" : "rgba(255,255,255,0.14)"}
                  stroke={m.hit ? "#fff" : "rgba(255,255,255,0.35)"} strokeWidth={m.hit ? 3 : 1.5} />
                {m.hit && (
                  <path d={`M${p.x - 5} ${p.y} l3.5 4 6.5-8`} stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {i === hereIdx && (
                  <circle cx={p.x} cy={p.y} r="19" fill="none" stroke="#d9ff4f" strokeWidth="2" opacity="0.85" className="pulse-soft" />
                )}
              </g>
            );
          })}
        </svg>

        {/* header + you-are-here overlays */}
        <div className="absolute top-0 inset-x-0 pt-5 text-center">
          <h2 className="font-display text-2xl text-ink">Your Ascent</h2>
          <p className="text-[11px] text-ink/50 mt-0.5">
            {reached} of {milestones.length} milestones
          </p>
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-md px-5 py-3.5 flex items-center justify-between">
          <p className="text-xs font-bold text-ink">You are here</p>
          <p className="text-xs text-ink/70">
            {milestones[hereIdx]?.hit ? milestones[hereIdx].label : "Base camp — play a session"}
          </p>
        </div>
      </div>

      {/* milestone list */}
      <div className="mt-4 space-y-2">
        {milestones.map((m, i) => (
          <div key={m.label}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
              m.hit ? "bg-tile border-ink/5" : "bg-tile/50 border-ink/5"
            }`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              m.hit ? "bg-rosedeep text-white" : "bg-ink/10 text-inkmuted"
            }`}>
              {i + 1}
            </span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${m.hit ? "text-ink" : "text-inkmuted"}`}>{m.label}</p>
              <p className="text-[11px] text-inkmuted">{m.detail}</p>
            </div>
            {m.hit && <span className="text-[10px] font-bold text-rosedeep">REACHED</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
