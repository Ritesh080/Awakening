import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Stethoscope, Play, Wind, Leaf, ShieldAlert, Lock } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import Illustration from "../components/Illustrations.jsx";
import { byCategory } from "../data/programs.js";
import { useAppState } from "../store.jsx";

// Rule-based matcher: typed problem → practice prescription. This recommends
// meditation practices and habits only — never medication. Keep it that way:
// medication advice requires a licensed clinician.
const TOPICS = [
  {
    id: "sleep",
    keywords: ["sleep", "insomnia", "awake at night", "can't fall", "tired", "exhaust", "restless night"],
    title: "Restless sleep",
    summary: "Your body wants rest but your mind hasn't gotten the memo. The remedy is a downshift ritual, not more effort.",
    category: "sleep",
    technique: {
      name: "4-8 descent breathing",
      steps: ["Lie down, lights off, phone away", "Inhale through the nose for 4 counts", "Exhale slowly for 8 counts", "Repeat 10 times, letting each exhale sink you deeper"],
    },
    tip: "Same bedtime every night for a week — the body learns rhythm faster than the mind does.",
  },
  {
    id: "anxiety",
    keywords: ["anxi", "panic", "worry", "overthink", "stress", "pressure", "nervous", "overwhelm", "racing"],
    title: "An anxious, racing mind",
    summary: "Anxiety is the mind rehearsing futures that haven't happened. The remedy is returning to the one moment that has.",
    category: "anxiety",
    technique: {
      name: "Physiological sigh",
      steps: ["Deep inhale through the nose", "One extra short sip of air on top", "Long, slow exhale through the mouth", "Repeat 3 times — this is the fastest known off-switch for acute stress"],
    },
    tip: "Name it to tame it: saying 'I notice I'm anxious' out loud moves activity from alarm to observation.",
  },
  {
    id: "confidence",
    keywords: ["confiden", "doubt", "imposter", "not good enough", "failure", "insecure", "afraid to", "scared to"],
    title: "Shaky self-belief",
    summary: "The inner critic is loud because it's unchallenged. The remedy is evidence, gathered daily.",
    category: "selfbelief",
    technique: {
      name: "Evidence locker",
      steps: ["Each night, write one hard thing you did anyway", "Read the list before any big moment", "Speak to yourself as you would to a friend"],
    },
    tip: "Confidence follows action — do the small brave thing first, the feeling arrives second.",
  },
  {
    id: "heart",
    keywords: ["heartbreak", "breakup", "lonely", "grief", "loss", "sad", "miss ", "alone", "depress"],
    title: "A heavy heart",
    summary: "Heaviness is love with nowhere to go. The remedy is letting it move — through you, not around you.",
    category: "guided",
    technique: {
      name: "Hand-on-heart breathing",
      steps: ["Place a hand flat on your chest", "Breathe into the warmth under your palm", "Silently: 'This hurts, and I can hold it'", "Stay for 2 minutes — no fixing, just company"],
    },
    tip: "Grief and sadness need witnesses: one honest conversation this week beats ten distractions.",
  },
  {
    id: "focus",
    keywords: ["focus", "distract", "procrastinat", "concentrat", "scattered", "adhd", "attention"],
    title: "A scattered focus",
    summary: "Attention is a muscle currently being trained by your notifications. The remedy is deliberate, single-pointed reps.",
    category: "gateway",
    technique: {
      name: "One-breath reset",
      steps: ["When you notice drift, stop fully", "Take one slow, complete breath", "Name the next single action", "Begin it within 5 seconds"],
    },
    tip: "Phone in another room during deep work — willpower is no match for proximity.",
  },
  {
    id: "anger",
    keywords: ["anger", "angry", "frustrat", "irritab", "rage", "annoyed", "temper"],
    title: "A short fuse",
    summary: "Anger is energy arriving faster than wisdom. The remedy is adding one breath of space between spark and response.",
    category: "calm",
    technique: {
      name: "The sacred pause",
      steps: ["Feel the heat rise — that's your cue", "Unclench jaw and hands", "One long exhale before any words", "Ask: 'What do I actually want here?'"],
    },
    tip: "Anger often rides on tired and hungry — check both before checking your grievances.",
  },
  {
    id: "stuck",
    keywords: ["stuck", "motivat", "purpose", "direction", "lost", "goal", "dream", "future"],
    title: "Feeling stuck",
    summary: "Stuckness is usually vagueness in disguise. The remedy is a vivid picture of the next chapter — then one small step.",
    category: "manifestation",
    technique: {
      name: "Future-self minute",
      steps: ["Close your eyes for 60 seconds", "Picture yourself one year on, thriving", "Notice one thing that version does daily", "Do a 10-minute version of it today"],
    },
    tip: "Motion creates clarity — you can't steer a parked car.",
  },
  {
    id: "selftalk",
    keywords: ["negative thought", "self talk", "hate myself", "criticiz", "worthless", "ugly", "not enough"],
    title: "Harsh self-talk",
    summary: "The voice in your head learned its script somewhere — it can learn a new one. The remedy is repetition with feeling.",
    category: "affirmations",
    technique: {
      name: "Exhale affirmation",
      steps: ["Inhale slowly through the nose", "On the exhale: 'I am enough — now'", "Let any pushback be there, keep going", "10 breaths, morning and night"],
    },
    tip: "Write the phrase where you'll see it — the bathroom mirror outranks the meditation cushion.",
  },
];

const CRISIS_WORDS = ["suicid", "kill myself", "end my life", "self harm", "self-harm", "hurt myself", "don't want to live", "dont want to live", "want to die"];

function match(text) {
  const t = text.toLowerCase();
  if (CRISIS_WORDS.some((w) => t.includes(w))) return { crisis: true, topics: [] };
  const scored = TOPICS.map((topic) => ({
    topic,
    score: topic.keywords.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((s) => s.topic);
  return { crisis: false, topics: scored.length ? scored : [TOPICS[1]] }; // default: anxiety/stress
}

export default function Remedy() {
  const { user, isPremium, setPaywallOpen } = useAppState();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const submit = () => {
    if (!user) {
      navigate("/register?next=/app/remedy");
      return;
    }
    if (!isPremium) {
      setPaywallOpen(true);
      return;
    }
    if (text.trim().length < 5) return;
    setResult(match(text));
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">Remedy</h1>
        {!isPremium && <Lock size={16} className="text-inkmuted" />}
        {isPremium && <span className="w-6" />}
      </div>

      <div className="px-7 mt-6">
        <span className="inline-flex h-12 w-12 rounded-2xl bg-blush items-center justify-center">
          <Stethoscope className="text-rosedeep" size={22} />
        </span>
        <h2 className="font-display text-[26px] leading-snug text-ink mt-4">
          What's troubling you?
        </h2>
        <p className="text-sm text-inkmuted mt-2 leading-relaxed">
          Describe it in your own words. You'll get a practice prescription:
          matched sessions, a technique for the moment, and one habit to try.
        </p>
      </div>

      <div className="px-6 mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I can't sleep because my mind races about work…"
          rows={3}
          className="w-full rounded-2xl border border-ink/10 bg-tile px-4 py-3.5 text-sm text-ink placeholder-inkmuted focus:outline-none focus:ring-2 focus:ring-rose resize-none"
        />
        <button onClick={submit}
          disabled={text.trim().length < 5}
          className="mt-3 w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition disabled:opacity-50">
          {isPremium ? "Get my remedy" : "Get my remedy (Premium)"}
        </button>
      </div>

      {result?.crisis && (
        <div className="mx-6 mt-6 bg-rosedeep/10 border border-rosedeep/30 rounded-3xl p-5">
          <p className="font-semibold text-ink flex items-center gap-2">
            <ShieldAlert size={18} className="text-rosedeep" /> Please reach out to a person, right now
          </p>
          <p className="text-sm text-ink/80 mt-2 leading-relaxed">
            What you're carrying deserves real human support, not an app. If
            you're in immediate danger, call your local emergency number. You
            can find a crisis helpline for your country at{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="underline font-semibold">
              findahelpline.com
            </a>{" "}
            — in India, AASRA is at +91-9820466726, 24/7. Talking to someone
            today is the bravest session you can do.
          </p>
        </div>
      )}

      {result && !result.crisis && (
        <div className="px-6 mt-6 space-y-5 pb-6 fade-up">
          {result.topics.map((topic) => (
            <div key={topic.id} className="bg-tile rounded-4xl border border-ink/5 p-5">
              <p className="text-[11px] font-bold text-rosedeep tracking-wide uppercase">Remedy for</p>
              <h3 className="font-display text-xl text-ink mt-1">{topic.title}</h3>
              <p className="text-sm text-inkmuted mt-2 leading-relaxed">{topic.summary}</p>

              <div className="mt-4 bg-cardsoft rounded-2xl p-4">
                <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Wind size={14} className="text-rosedeep" /> Right now: {topic.technique.name}
                </p>
                <ol className="mt-2 space-y-1.5">
                  {topic.technique.steps.map((s, i) => (
                    <li key={i} className="text-xs text-inkmuted flex gap-2">
                      <span className="font-bold text-rosedeep">{i + 1}.</span> {s}
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-xs text-inkmuted mt-3 flex items-start gap-1.5">
                <Leaf size={13} className="text-rosedeep shrink-0 mt-0.5" /> {topic.tip}
              </p>

              <div className="mt-4 space-y-2.5">
                {byCategory(topic.category).slice(0, 2).map((p) => (
                  <Link key={p.id} to={`/app/program/${p.id}`}
                    className="flex items-center gap-3 bg-cardsoft rounded-2xl p-3 hover:shadow-soft transition">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-tile overflow-hidden">
                      <Illustration name={p.illustration} className="w-full h-full scale-110" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{p.title}</p>
                      <p className="text-[11px] text-inkmuted">{p.duration}</p>
                    </div>
                    <span className="h-7 w-7 rounded-full bg-ink flex items-center justify-center shrink-0">
                      <Play size={10} className="text-white fill-white ml-px" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mx-6 mt-2 mb-6 text-[11px] text-inkmuted leading-relaxed bg-cardsoft rounded-2xl px-4 py-3">
        Awakening offers meditation and lifestyle practices — not medical
        care. For medication, diagnosis, or symptoms that persist, please see
        a licensed doctor or therapist.
      </p>
    </AppShell>
  );
}
