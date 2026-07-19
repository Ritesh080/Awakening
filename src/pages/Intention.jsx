import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ChevronLeft, Sparkles, Play, Pencil } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import Illustration from "../components/Illustrations.jsx";
import { byCategory, CATEGORIES } from "../data/programs.js";
import { useAppState } from "../store.jsx";

// Curated desires — each maps to the practice category most likely to get
// the user there. Phrased as achievable inner shifts, not outcomes.
export const DESIRES = [
  { text: "Unshakeable confidence", category: "selfbelief" },
  { text: "Deep, easy sleep", category: "sleep" },
  { text: "Calm under pressure", category: "anxiety" },
  { text: "A focused, quiet mind", category: "gateway" },
  { text: "Kindness toward myself", category: "affirmations" },
  { text: "An abundant mindset", category: "manifestation" },
  { text: "Stillness in my day", category: "calm" },
  { text: "A softer, open heart", category: "guided" },
];

export default function Intention() {
  const { user, settings, saveSetting } = useAppState();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const welcome = params.get("welcome") === "1";
  const existing = settings.intention;

  const [editing, setEditing] = useState(!existing);
  const [text, setText] = useState(existing?.text || "");
  const [category, setCategory] = useState(existing?.category || "");
  const [error, setError] = useState("");

  if (!user) {
    return (
      <AppShell>
        <div className="px-8 mt-24 text-center">
          <h1 className="font-display text-2xl text-ink">Name what you want to awaken</h1>
          <p className="text-sm text-inkmuted mt-2">Create a free account to set your intention.</p>
          <Link to="/register" className="mt-6 block w-full rounded-full bg-ink text-card py-4 font-semibold">
            Create account
          </Link>
        </div>
      </AppShell>
    );
  }

  const pick = (d) => {
    setText(d.text);
    setCategory(d.category);
    setError("");
  };

  const save = async () => {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setError("Give your awakening a few words — small and true beats grand and vague.");
      return;
    }
    if (!category) {
      setError("Pick a focus area so we can match your practice to it.");
      return;
    }
    await saveSetting("intention", {
      text: trimmed,
      category,
      createdAt: existing?.createdAt || new Date().toISOString(),
    });
    setEditing(false);
  };

  const recs = category ? byCategory(category).slice(0, 3) : [];
  const catLabel = CATEGORIES.find((c) => c.id === category)?.label;

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">Your Awakening</h1>
        <span className="w-6" />
      </div>

      {welcome && (
        <p className="mx-6 mt-4 bg-blush/60 rounded-2xl px-4 py-3 text-xs text-ink">
          Welcome, {user.name.split(" ")[0]} 🌸 One question before you begin —
        </p>
      )}

      {editing ? (
        <>
          <div className="px-7 mt-6">
            <h2 className="font-display text-[26px] leading-snug text-ink">
              What do you want to awaken in yourself?
            </h2>
            <p className="text-sm text-inkmuted mt-2 leading-relaxed">
              Pick something achievable and inner — a way of being, not a
              trophy. "Calm under pressure" works; "a million dollars" is a
              different app.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 px-6 mt-5">
            {DESIRES.map((d) => (
              <button key={d.text} onClick={() => pick(d)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  text === d.text
                    ? "bg-ink text-card font-semibold"
                    : "bg-tile text-inkmuted border border-ink/10 hover:text-ink"
                }`}>
                {d.text}
              </button>
            ))}
          </div>

          <div className="px-6 mt-5">
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setError(""); }}
              placeholder="…or write your own: I want to awaken…"
              rows={2}
              className="w-full rounded-2xl border border-ink/10 bg-tile px-4 py-3.5 text-sm text-ink placeholder-inkmuted focus:outline-none focus:ring-2 focus:ring-rose resize-none"
            />
            <p className="text-xs font-semibold text-ink mt-4">Focus area</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => { setCategory(c.id); setError(""); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition ${
                    category === c.id
                      ? "bg-rosedeep text-white font-bold"
                      : "bg-tile text-inkmuted border border-ink/10"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-rosedeep mt-3">{error}</p>}
            <button onClick={save}
              className="mt-5 w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition">
              Set my awakening
            </button>
            {welcome && (
              <button onClick={() => navigate("/app")}
                className="mt-3 w-full text-sm text-inkmuted hover:text-ink py-1">
                Skip for now
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mx-6 mt-6 bg-lavender rounded-4xl p-6 text-center relative overflow-hidden">
            <span className="inline-flex h-11 w-11 rounded-2xl bg-blush items-center justify-center">
              <Sparkles className="text-rosedeep" size={20} />
            </span>
            <p className="text-xs text-inkmuted mt-3">You are awakening</p>
            <h2 className="font-display text-2xl text-ink mt-1 leading-snug">
              “{existing?.text || text}”
            </h2>
            <p className="text-[11px] text-inkmuted mt-2">
              Focus: {catLabel} · since {new Date(existing?.createdAt || Date.now()).toLocaleDateString()}
            </p>
            <button onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-ink bg-tile rounded-full px-4 py-2 shadow-soft">
              <Pencil size={12} /> Refine it
            </button>
          </div>

          <div className="px-6 mt-6">
            <h3 className="font-display text-lg text-ink">Your path there</h3>
            <p className="text-xs text-inkmuted mt-1">
              Practices chosen for this awakening — every session is a step.
            </p>
            <div className="mt-3 space-y-3 pb-6">
              {recs.map((p) => (
                <Link key={p.id} to={`/app/program/${p.id}`}
                  className="flex items-center gap-4 bg-tile rounded-3xl p-3.5 border border-ink/5 hover:shadow-soft transition">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-cardsoft overflow-hidden">
                    <Illustration name={p.illustration} className="w-full h-full scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] text-ink truncate">{p.title}</p>
                    <p className="text-xs text-inkmuted mt-0.5">{p.duration} · Voice: {p.voice}</p>
                  </div>
                  <span className="h-8 w-8 rounded-full bg-ink flex items-center justify-center shrink-0">
                    <Play size={12} className="text-white fill-white ml-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
