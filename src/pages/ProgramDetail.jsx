import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Clock, Lock, Play } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import Illustration from "../components/Illustrations.jsx";
import { getProgram, totalSeconds } from "../data/programs.js";
import { auraStyle } from "../lib/theme.js";
import { useAppState } from "../store.jsx";

export default function ProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isPremium } = useAppState();
  const program = getProgram(id);

  if (!program) {
    return (
      <AppShell>
        <div className="p-8 text-center text-inkmuted">Program not found.</div>
      </AppShell>
    );
  }

  const mins = Math.round(totalSeconds(program) / 60);

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">{program.title}</h1>
        <span className="w-6" />
      </div>

      <div className="mx-6 mt-6 bg-lavender rounded-4xl p-6 relative overflow-hidden">
        <div className="h-40 w-40 mx-auto">
          <Illustration name={program.illustration} className="w-full h-full" />
        </div>
        <p className="text-center font-display text-xl text-ink mt-2">
          {program.subtitle}
        </p>
        <p className="text-center text-xs text-inkmuted mt-2">
          Voice: {program.voice} · {program.level}
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-inkmuted">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {mins} min
          </span>
          <span>·</span>
          <span>{program.sessions} sessions in this program</span>
        </div>
      </div>

      <p className="px-7 mt-5 text-sm leading-relaxed text-inkmuted">
        {program.description}
      </p>

      <div className="px-6 mt-6">
        <h2 className="font-display text-lg text-ink">Session steps</h2>
        <div className="mt-3 space-y-2.5">
          {program.steps.map((step, i) => {
            const locked = !step.free && !isPremium;
            return (
              <div
                key={i}
                className={`flex items-center gap-3.5 rounded-3xl p-4 border ${
                  locked ? "bg-cardsoft border-ink/5" : "bg-tile border-ink/5"
                }`}
              >
                <span className="h-9 w-9 rounded-full bg-lavender flex items-center justify-center font-semibold text-sm text-ink shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${locked ? "text-inkmuted" : "text-ink"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-inkmuted mt-0.5">
                    {Math.round(step.seconds / 60) || 1} min
                  </p>
                </div>
                {locked ? (
                  <Lock size={15} className="text-inkmuted shrink-0" />
                ) : (
                  <span className="text-[11px] font-semibold text-rosedeep bg-blush rounded-full px-2.5 py-1 shrink-0">
                    Free
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <Link
          to={`/app/session/${program.id}`}
          className="mt-6 mb-4 flex items-center justify-center gap-2.5 w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition"
        >
          <Play size={16} className="fill-card" /> Begin session
        </Link>
      </div>
    </AppShell>
  );
}
