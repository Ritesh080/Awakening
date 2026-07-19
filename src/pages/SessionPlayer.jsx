import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Pause, Play, RotateCcw, RotateCw, CheckCircle2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { getProgram, totalSeconds } from "../data/programs.js";
import { TONE_AURAS } from "../lib/theme.js";
import { useAppState } from "../store.jsx";
import { AmbientEngine } from "../audio/engine.js";
import { api } from "../lib/api.js";

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// Deterministic pseudo-random waveform bars (stable between renders)
const BARS = Array.from({ length: 48 }, (_, i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return 0.25 + (x - Math.floor(x)) * 0.75;
});

export default function SessionPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isPremium, user, setPaywallOpen, setUser } = useAppState();
  const program = getProgram(id);

  const total = useMemo(() => (program ? totalSeconds(program) : 0), [program]);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const engineRef = useRef(null);
  const stepIndexRef = useRef(0);

  // Boundaries: cumulative seconds at the start of each step
  const bounds = useMemo(() => {
    if (!program) return [];
    let acc = 0;
    return program.steps.map((s) => {
      const start = acc;
      acc += s.seconds;
      return start;
    });
  }, [program]);

  const stepAt = useCallback(
    (t) => {
      let idx = 0;
      for (let i = 0; i < bounds.length; i++) if (t >= bounds[i]) idx = i;
      return idx;
    },
    [bounds]
  );

  const firstLockedAt = useMemo(() => {
    if (!program) return Infinity;
    const i = program.steps.findIndex((s) => !s.free);
    return i === -1 ? Infinity : bounds[i];
  }, [program, bounds]);

  useEffect(() => {
    engineRef.current = new AmbientEngine();
    return () => engineRef.current?.destroy();
  }, []);

  // Main clock — the updater stays pure; all side effects react to `elapsed`
  // below (StrictMode double-invokes updaters in dev, so effects in them
  // would fire twice).
  useEffect(() => {
    if (!playing || done) return;
    const iv = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [playing, done]);

  const completionSentRef = useRef(false);

  useEffect(() => {
    if (!started || done) return;

    // Paywall gate
    if (!isPremium && elapsed >= firstLockedAt) {
      setElapsed(firstLockedAt);
      setPlaying(false);
      engineRef.current?.pause();
      setPaywallOpen(true);
      return;
    }

    // Step transition chime
    const idx = stepAt(elapsed);
    if (idx !== stepIndexRef.current) {
      stepIndexRef.current = idx;
      engineRef.current?.chime();
    }

    // Finished
    if (elapsed >= total) {
      setElapsed(total);
      setPlaying(false);
      setDone(true);
      engineRef.current?.pause();
      if (user && !completionSentRef.current) {
        completionSentRef.current = true;
        api("/progress/complete", {
          method: "POST",
          body: { programId: program.id, seconds: total },
        })
          .then((data) => data?.user && setUser(data.user))
          .catch(() => {});
      }
    }
  }, [elapsed, started, done, isPremium, firstLockedAt, total, stepAt, program, user, setPaywallOpen, setUser]);

  if (!program) {
    return (
      <AppShell hideNav>
        <div className="p-8 text-center text-inkmuted">Program not found.</div>
      </AppShell>
    );
  }

  const stepIdx = stepAt(elapsed);
  const step = program.steps[stepIdx];
  const progress = total ? elapsed / total : 0;

  const toggle = () => {
    if (done) return;
    if (!started) {
      engineRef.current?.start(program.tone);
      setStarted(true);
      setPlaying(true);
      return;
    }
    if (playing) {
      engineRef.current?.pause();
      setPlaying(false);
    } else {
      if (!isPremium && elapsed >= firstLockedAt) {
        setPaywallOpen(true);
        return;
      }
      engineRef.current?.resume();
      setPlaying(true);
    }
  };

  const seek = (delta) => {
    if (done) return;
    setElapsed((t) => {
      let next = Math.max(0, Math.min(total - 1, t + delta));
      if (!isPremium && next >= firstLockedAt) next = Math.max(0, firstLockedAt - 1);
      stepIndexRef.current = stepAt(next);
      return next;
    });
  };

  return (
    <AppShell hideNav>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">{program.title}</h1>
        <span className="w-6" />
      </div>

      {done ? (
        <Finished program={program} total={total} />
      ) : (
        <>
          {/* Breathing aura bloom */}
          <div className="flex justify-center mt-10">
            <div className={`relative h-64 w-64 ${playing ? "" : "orb-paused"}`}>
              <div
                className="orb-breathe absolute -inset-8 rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle at 50% 45%, ${(TONE_AURAS[program.tone] || TONE_AURAS.lavender).a}66, transparent 70%)`,
                }}
              />
              <div
                className="orb-breathe absolute inset-0 rounded-full blur-xl opacity-90"
                style={{
                  background: `radial-gradient(circle at 42% 38%, ${(TONE_AURAS[program.tone] || TONE_AURAS.lavender).a}, ${(TONE_AURAS[program.tone] || TONE_AURAS.lavender).b} 75%, transparent)`,
                }}
              />
              <div
                className="orb-inner absolute inset-10 rounded-full blur-2xl mix-blend-screen"
                style={{
                  background: `radial-gradient(circle at 60% 60%, ${(TONE_AURAS[program.tone] || TONE_AURAS.lavender).b}, transparent 70%)`,
                }}
              />
              <svg viewBox="0 0 200 60" className="absolute inset-x-6 top-1/2 -translate-y-1/2 opacity-60">
                <path
                  d="M0 30 C 20 10, 35 50, 55 30 S 90 10, 110 30 S 145 50, 165 30 S 190 20, 200 30"
                  fill="none" stroke="#d9ff4f" strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          {/* Step instruction */}
          <div className="px-10 mt-10 text-center min-h-[110px]" key={stepIdx}>
            <h2 className="font-display text-[26px] leading-snug text-ink fade-up">
              {started ? step.title : program.subtitle}
            </h2>
            <p className="text-sm text-inkmuted mt-3 leading-relaxed fade-up">
              {started ? step.instruction : `Voice: ${program.voice}`}
            </p>
          </div>

          {/* Waveform progress */}
          <div className="flex items-center gap-3 px-8 mt-8">
            <span className="font-dot font-bold text-sm text-ink tabular-nums w-10">{fmt(elapsed)}</span>
            <div className="flex-1 flex items-center gap-[3px] h-8">
              {BARS.map((h, i) => {
                const played = i / BARS.length <= progress;
                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full ${played ? "bg-neon" : "bg-white/15"}`}
                    style={{ height: `${h * 100}%` }}
                  />
                );
              })}
            </div>
            <span className="font-dot font-bold text-sm text-inkmuted tabular-nums w-10 text-right">{fmt(total)}</span>
          </div>

          {/* Transport */}
          <div className="flex items-center justify-center gap-10 mt-8 pb-10">
            <button aria-label="Back 10 seconds" onClick={() => seek(-10)} className="relative text-ink p-2">
              <RotateCcw size={26} strokeWidth={1.8} />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-0.5">10</span>
            </button>
            <button
              aria-label={playing ? "Pause" : "Play"}
              onClick={toggle}
              className="h-16 w-16 rounded-full bg-ink text-card flex items-center justify-center shadow-card hover:scale-105 transition"
            >
              {playing ? (
                <Pause size={24} className="fill-card" />
              ) : (
                <Play size={24} className="fill-card ml-1" />
              )}
            </button>
            <button aria-label="Forward 10 seconds" onClick={() => seek(10)} className="relative text-ink p-2">
              <RotateCw size={26} strokeWidth={1.8} />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-0.5">10</span>
            </button>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Finished({ program, total }) {
  return (
    <div className="flex flex-col items-center px-8 mt-16 text-center fade-up">
      <span className="h-20 w-20 rounded-full bg-blush flex items-center justify-center">
        <CheckCircle2 size={40} className="text-rosedeep" />
      </span>
      <h2 className="font-display text-3xl text-ink mt-6">Session complete</h2>
      <p className="text-sm text-inkmuted mt-3 leading-relaxed">
        You just gave yourself {Math.round(total / 60)} minutes of stillness with{" "}
        {program.title}. Notice how you feel before rushing to the next thing.
      </p>
      <Link
        to="/app"
        className="mt-8 w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition"
      >
        Back home
      </Link>
      <Link to="/app/journey" className="mt-3 text-sm text-inkmuted hover:text-ink">
        See your progress
      </Link>
    </div>
  );
}
