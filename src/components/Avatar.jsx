// Personalized, evolving meditator avatar. Appearance options are chosen by
// the user in the Avatar Studio; evolution (aura, lotus, radiance) is earned
// with practice minutes via the Journey levels.

export const SKINS = ["#f6dcb8", "#e9bd90", "#c68a58", "#8a5632"];
export const HAIR_COLORS = ["#1f2a44", "#5b3a22", "#a56a3a", "#b6bdcb"];
export const HAIRS = [
  { id: "short", label: "Short" },
  { id: "bun", label: "Top bun" },
  { id: "long", label: "Long" },
  { id: "buzz", label: "Buzz" },
];
export const OUTFITS = ["#c9d3ea", "#fbd3e0", "#bcd8c6", "#f3ddb0"];

export const DEFAULT_AVATAR = { skin: 0, hair: 0, hairColor: 0, outfit: 0 };

const INK = "#1f2a44";

export function PersonalAvatar({ config = DEFAULT_AVATAR, level = 0, className = "" }) {
  const skin = SKINS[config.skin] ?? SKINS[0];
  const hairColor = HAIR_COLORS[config.hairColor] ?? HAIR_COLORS[0];
  const hair = HAIRS[config.hair]?.id ?? "short";
  const outfit = OUTFITS[config.outfit] ?? OUTFITS[0];
  const rings = Math.min(level + 1, 4);

  return (
    <svg viewBox="0 0 200 200" className={className}>
      {/* aura — grows with level */}
      {Array.from({ length: rings }).map((_, r) => (
        <circle key={r} cx="100" cy="106" r={50 + r * 15} fill="none"
          stroke="#f27ba8" strokeOpacity={0.45 - r * 0.1} strokeWidth="2"
          strokeDasharray={r === 0 ? "none" : "3 7"} />
      ))}
      <circle cx="100" cy="106" r="48" fill="#fbd3e0" opacity="0.4" />

      {/* cushion */}
      <ellipse cx="100" cy="158" rx="46" ry="12" fill={outfit} stroke={INK} strokeWidth="2.5" />

      {/* crossed legs / robe base */}
      <path d="M62 150c4-16 16-26 38-26s34 10 38 26c-10 6-24 9-38 9s-28-3-38-9z"
        fill={outfit} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />

      {/* torso */}
      <path d="M78 148c-2-26 6-44 22-44s24 18 22 44c-7 3-14 4-22 4s-15-1-22-4z"
        fill={outfit} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />

      {/* arms resting on knees */}
      <path d="M80 116c-8 8-12 18-11 28M120 116c8 8 12 18 11 28"
        fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="146" r="5" fill={skin} stroke={INK} strokeWidth="2" />
      <circle cx="130" cy="146" r="5" fill={skin} stroke={INK} strokeWidth="2" />

      {/* head */}
      <circle cx="100" cy="84" r="19" fill={skin} stroke={INK} strokeWidth="2.5" />

      {/* hair variants */}
      {hair === "short" && (
        <path d="M82 80c0-12 8-19 18-19s18 7 18 19c-4-7-10-10-18-10s-14 3-18 10z"
          fill={hairColor} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      )}
      {hair === "bun" && (
        <>
          <circle cx="100" cy="60" r="8" fill={hairColor} stroke={INK} strokeWidth="2" />
          <path d="M82 80c0-12 8-19 18-19s18 7 18 19c-4-7-10-10-18-10s-14 3-18 10z"
            fill={hairColor} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      )}
      {hair === "long" && (
        <path d="M82 80c0-12 8-19 18-19s18 7 18 19c0 0 4 14 2 26-3-2-5-6-6-10-2 6-1 12 0 16-4-3-6-7-7-12-6 2-12 2-14 0-1 5-3 9-7 12 1-4 2-10 0-16-1 4-3 8-6 10-2-12 2-26 2-26z"
          fill={hairColor} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      )}
      {hair === "buzz" && (
        <path d="M84 76c1-9 8-15 16-15s15 6 16 15c-5-5-10-7-16-7s-11 2-16 7z"
          fill={hairColor} opacity="0.55" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      )}

      {/* face — serene closed eyes, smile grows with level */}
      <path d="M92 84c2 2 4 2 6 0M102 84c2 2 4 2 6 0"
        fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d={level >= 2 ? "M94 92c3 3.5 9 3.5 12 0" : "M95 92c2.5 2 7.5 2 10 0"}
        fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {level >= 2 && (
        <>
          <circle cx="88" cy="89" r="2.5" fill="#f7a8c4" opacity="0.7" />
          <circle cx="112" cy="89" r="2.5" fill="#f7a8c4" opacity="0.7" />
        </>
      )}

      {/* level 3+: lotus blooms beside the cushion */}
      {level >= 3 && (
        <>
          <Lotus x={44} y={152} />
          <Lotus x={156} y={152} />
        </>
      )}

      {/* level 4: radiance above the crown */}
      {level >= 4 && (
        <g fill="#f27ba8">
          <circle cx="100" cy="48" r="3" />
          <circle cx="88" cy="53" r="1.8" opacity="0.7" />
          <circle cx="112" cy="53" r="1.8" opacity="0.7" />
          <path d="M100 38v-6M91 42l-4-5M109 42l4-5" stroke="#f27ba8" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      )}
    </svg>
  );
}

function Lotus({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0c-4-2-6-6-4-10 4 1 6 4 6 8 0-4 2-7 6-8 2 4 0 8-4 10h-4z"
        fill="#f7a8c4" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M-6 2c3 2 10 2 14 0" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}
