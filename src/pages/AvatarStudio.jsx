import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { PersonalAvatar, DEFAULT_AVATAR, SKINS, HAIRS, HAIR_COLORS, OUTFITS } from "../components/Avatar.jsx";
import { useAppState } from "../store.jsx";

const LEVEL_HINTS = [
  "Right now — a calm beginning",
  "30 min — a warmer smile",
  "90 min — blush of steadiness",
  "200 min — lotus blooms appear",
  "400 min — full radiance",
];

export default function AvatarStudio() {
  const { user, settings, saveSetting } = useAppState();
  const navigate = useNavigate();
  const [config, setConfig] = useState(settings.avatar || DEFAULT_AVATAR);
  const [preview, setPreview] = useState(null); // preview evolution level
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <AppShell>
        <div className="px-8 mt-24 text-center">
          <h1 className="font-display text-2xl text-ink">Make it yours</h1>
          <p className="text-sm text-inkmuted mt-2">Sign in to personalize your avatar.</p>
          <Link to="/login" className="mt-6 block w-full rounded-full bg-ink text-card py-4 font-semibold">
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  const level = preview ?? Math.min(4, [0, 30, 90, 200, 400].filter((m) => user.stats.minutes >= m).length - 1);

  const save = async () => {
    await saveSetting("avatar", config);
    setSaved(true);
    setTimeout(() => navigate("/app/journey"), 700);
  };

  const set = (key, i) => {
    setConfig((c) => ({ ...c, [key]: i }));
    setSaved(false);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 pt-6">
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink">Avatar Studio</h1>
        <span className="w-6" />
      </div>

      <div className="mx-6 mt-5 bg-lavender rounded-4xl p-4">
        <PersonalAvatar config={config} level={level} className="h-56 w-56 mx-auto" />
        {/* evolution preview scrubber */}
        <div className="flex justify-center gap-1.5 mt-1">
          {LEVEL_HINTS.map((_, i) => (
            <button key={i} onClick={() => setPreview(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${i === level ? "bg-rosedeep scale-125" : "bg-ink/20"}`}
              aria-label={`Preview level ${i + 1}`} />
          ))}
        </div>
        <p className="text-center text-[11px] text-inkmuted mt-2">
          {LEVEL_HINTS[level]} · your avatar evolves as you practice
        </p>
      </div>

      <div className="px-6 mt-5 space-y-5 pb-6">
        <Picker label="Skin tone">
          {SKINS.map((c, i) => (
            <Swatch key={c} color={c} active={config.skin === i} onClick={() => set("skin", i)} />
          ))}
        </Picker>

        <Picker label="Hair">
          {HAIRS.map((h, i) => (
            <button key={h.id} onClick={() => set("hair", i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                config.hair === i ? "bg-ink text-card" : "bg-tile text-inkmuted border border-ink/10"
              }`}>
              {h.label}
            </button>
          ))}
        </Picker>

        <Picker label="Hair color">
          {HAIR_COLORS.map((c, i) => (
            <Swatch key={c} color={c} active={config.hairColor === i} onClick={() => set("hairColor", i)} />
          ))}
        </Picker>

        <Picker label="Robe">
          {OUTFITS.map((c, i) => (
            <Swatch key={c} color={c} active={config.outfit === i} onClick={() => set("outfit", i)} />
          ))}
        </Picker>

        <button onClick={save}
          className="w-full rounded-full bg-ink text-card py-4 font-semibold hover:bg-ink/90 transition flex items-center justify-center gap-2">
          {saved ? (<><Check size={16} /> Saved</>) : "Save avatar"}
        </button>
      </div>
    </AppShell>
  );
}

function Picker({ label, children }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="flex items-center gap-3 mt-2.5 flex-wrap">{children}</div>
    </div>
  );
}

function Swatch({ color, active, onClick }) {
  return (
    <button onClick={onClick} aria-label={`Pick ${color}`}
      className={`h-10 w-10 rounded-full border-2 transition ${
        active ? "border-ink scale-110 shadow-soft" : "border-ink/10"
      }`}
      style={{ background: color }} />
  );
}
