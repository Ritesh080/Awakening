import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, PartyPopper, Flame, Trophy, Dices, Check } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { useAppState } from "../store.jsx";

// Funmaxxing: tiny, silly, science-adjacent joy quests. Three count per day;
// streaks reward showing up, not grinding.
const QUESTS = [
  { id: "dance", emoji: "🕺", text: "Two-minute dance break to one song — full commitment, no witnesses required." },
  { id: "pun", emoji: "🥸", text: "Text a friend your worst pun. Bonus points if they leave you on read." },
  { id: "mirror", emoji: "🪞", text: "Smile at yourself in a mirror for 30 seconds. Weird → funny → genuinely nice." },
  { id: "sky", emoji: "☁️", text: "Go outside and find a cloud that looks like an animal. Name it." },
  { id: "gratitude", emoji: "📣", text: "Tell one person, specifically, why they make your life better." },
  { id: "song", emoji: "🎤", text: "Sing the chorus of a song you loved at 14. Volume: unreasonable." },
  { id: "walk", emoji: "👟", text: "Take a 5-minute walk and count the colors you see. Beat 12." },
  { id: "doodle", emoji: "✏️", text: "Doodle your current mood as a creature. Give it a name and a job." },
  { id: "snack", emoji: "🍫", text: "Eat one snack with zero screens — taste it like a food critic." },
  { id: "compliment", emoji: "💌", text: "Give a stranger-safe compliment today (shoes and dogs always work)." },
  { id: "photo", emoji: "📸", text: "Take one photo of something small and beautiful you'd normally walk past." },
  { id: "stretch", emoji: "🙆", text: "60-second full-body stretch with an exaggerated lion yawn at the end." },
  { id: "laugh", emoji: "😂", text: "Watch one video that reliably makes you laugh. Rewatching classics allowed." },
  { id: "barefoot", emoji: "🌱", text: "Stand barefoot on grass or floor for one minute and just feel it." },
  { id: "call", emoji: "📞", text: "Voice-call (not text) someone you miss for five minutes." },
  { id: "rain", emoji: "🌧️", text: "Open a window and listen to outside for two minutes. City counts as nature." },
  { id: "tidy", emoji: "🧺", text: "Speed-tidy one tiny surface for 3 minutes. Admire it dramatically." },
  { id: "future", emoji: "📬", text: "Write one sentence to yourself for next month. Hide it somewhere you'll find it." },
  { id: "tea", emoji: "🍵", text: "Make a hot drink and do absolutely nothing else until it's finished." },
  { id: "silly-walk", emoji: "🦩", text: "Cross one room in your silliest walk. The Ministry would be proud." },
];

const LEVELS = [
  { min: 0, title: "Fun Rookie" },
  { min: 50, title: "Chuckle Apprentice" },
  { min: 120, title: "Joy Journeyman" },
  { min: 250, title: "Certified Funmaxxer" },
  { min: 500, title: "Grand Master of Whimsy" },
];

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 86400e3).toISOString().slice(0, 10);

export default function Funmax() {
  const { user, isPremium, setPaywallOpen, settings, saveSetting } = useAppState();
  const navigate = useNavigate();
  const fm = settings.funmax || { score: 0, streak: 0, lastDay: null, todayCount: 0, todayDate: null };
  const doneToday = fm.todayDate === today() ? fm.todayCount : 0;
  const [quest, setQuest] = useState(null);
  const [justDone, setJustDone] = useState(false);

  const level = LEVELS.reduce((acc, l, i) => (fm.score >= l.min ? i : acc), 0);

  const gate = () => {
    if (!user) {
      navigate("/register?next=/app/funmax");
      return true;
    }
    if (!isPremium) {
      setPaywallOpen(true);
      return true;
    }
    return false;
  };

  const draw = () => {
    if (gate()) return;
    const pool = QUESTS.filter((q) => q.id !== quest?.id);
    setQuest(pool[Math.floor(Math.random() * pool.length)]);
    setJustDone(false);
  };

  const complete = async () => {
    if (gate() || !quest) return;
    const t = today();
    const wasToday = fm.todayDate === t;
    const newTodayCount = (wasToday ? fm.todayCount : 0) + 1;
    const countsForScore = newTodayCount <= 3;
    const continuesStreak = fm.lastDay === t || fm.lastDay === yesterday();
    const next = {
      score: fm.score + (countsForScore ? 10 : 0),
      streak: fm.lastDay === t ? fm.streak : continuesStreak ? fm.streak + 1 : 1,
      lastDay: t,
      todayCount: newTodayCount,
      todayDate: t,
    };
    await saveSetting("funmax", next);
    setJustDone(true);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">Funmaxxing</h1>
        {!isPremium ? <Lock size={16} className="text-inkmuted" /> : <span className="w-6" />}
      </div>

      <div className="mx-6 mt-5 bg-gradient-to-br from-blush via-rose/60 to-lavender rounded-4xl p-6 text-center">
        <span className="inline-flex h-12 w-12 rounded-2xl bg-white/10 items-center justify-center">
          <PartyPopper className="text-rosedeep" size={22} />
        </span>
        <h2 className="font-display text-2xl text-ink mt-3">{LEVELS[level].title}</h2>
        <p className="text-xs text-ink/60 mt-1">
          {level < LEVELS.length - 1
            ? `${LEVELS[level + 1].min - fm.score} points to ${LEVELS[level + 1].title}`
            : "Maximum whimsy achieved"}
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <Stat icon={Trophy} value={fm.score} label="Fun points" />
          <Stat icon={Flame} value={fm.streak} label="Day streak" />
          <Stat icon={Check} value={`${Math.min(doneToday, 3)}/3`} label="Today" />
        </div>
      </div>

      <div className="px-7 mt-6">
        <p className="text-sm text-inkmuted leading-relaxed text-center">
          Meditation makes you calm. This makes you <em>fun</em>. Draw a joy
          quest, do it in the real world, and log it. Three count per day.
        </p>
      </div>

      <div className="px-6 mt-5 pb-8">
        {quest ? (
          <div className="bg-tile rounded-4xl border border-ink/5 p-7 text-center fade-up shadow-soft" key={quest.id}>
            <p className="text-5xl">{quest.emoji}</p>
            <p className="font-display text-xl text-ink mt-4 leading-snug">{quest.text}</p>
            {justDone ? (
              <div className="mt-6 fade-up">
                <p className="text-2xl">🎉</p>
                <p className="font-semibold text-rosedeep mt-1">
                  +{doneToday <= 3 ? 10 : 0} fun points{doneToday > 3 ? " (daily max reached — do it for the joy)" : ""}
                </p>
                <button onClick={draw}
                  className="mt-4 w-full rounded-full bg-ink text-card py-3.5 font-semibold">
                  Draw another
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-6">
                <button onClick={draw}
                  className="flex-1 rounded-full border border-ink/15 text-ink py-3.5 text-sm font-semibold hover:bg-cardsoft">
                  Reroll
                </button>
                <button onClick={complete}
                  className="flex-1 rounded-full bg-ink text-card py-3.5 text-sm font-semibold hover:bg-ink/90">
                  I did it!
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={draw}
            className="w-full bg-tile rounded-4xl border-2 border-dashed border-ink/15 p-10 text-center hover:shadow-soft transition">
            <Dices size={40} className="mx-auto text-rosedeep" />
            <p className="font-display text-xl text-ink mt-4">Draw today's joy quest</p>
            <p className="text-xs text-inkmuted mt-1.5">
              {isPremium ? "Tap to shuffle the deck" : "Premium — unlock with any plan"}
            </p>
          </button>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-2.5 min-w-[84px]">
      <Icon size={14} className="text-rosedeep mx-auto" />
      <p className="font-display text-lg text-ink leading-tight mt-0.5">{value}</p>
      <p className="text-[10px] text-inkmuted">{label}</p>
    </div>
  );
}
