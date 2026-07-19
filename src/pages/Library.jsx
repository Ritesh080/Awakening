import { Link } from "react-router-dom";
import { Play, Lock } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell.jsx";
import Illustration from "../components/Illustrations.jsx";
import { CATEGORIES, byCategory } from "../data/programs.js";
import { useAppState } from "../store.jsx";

export default function Library() {
  const { isPremium } = useAppState();
  return (
    <AppShell>
      <TopBar />
      <div className="px-6 mt-6">
        <h1 className="font-display text-3xl text-ink">Library</h1>
        <p className="text-sm text-inkmuted mt-1">
          Every program, organized by how you want to feel.
        </p>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat.id} className="px-6 mt-8">
          <h2 className="font-display text-lg text-ink">{cat.label}</h2>
          <div className="mt-3 space-y-3">
            {byCategory(cat.id).map((p) => (
              <Link
                key={p.id}
                to={`/app/program/${p.id}`}
                className="flex items-center gap-4 bg-tile rounded-3xl p-3.5 border border-ink/5 hover:shadow-soft transition"
              >
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-cardsoft overflow-hidden">
                  <Illustration name={p.illustration} className="w-full h-full scale-110" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[15px] text-ink truncate">{p.title}</p>
                  <p className="text-xs text-inkmuted mt-0.5">
                    {p.duration} · {p.sessions} sessions · Voice: {p.voice}
                  </p>
                </div>
                {!p.free && !isPremium ? (
                  <Lock size={16} className="text-inkmuted shrink-0 mr-1" />
                ) : (
                  <span className="h-8 w-8 rounded-full bg-ink flex items-center justify-center shrink-0">
                    <Play size={12} className="text-white fill-white ml-0.5" />
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <div className="h-6" />
    </AppShell>
  );
}
