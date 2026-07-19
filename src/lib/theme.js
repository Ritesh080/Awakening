// Per-category aura colors for the dark neon theme — used as blurred glow
// blobs inside tiles and as the player bloom.
export const AURAS = {
  calm:          { a: "#2dd4bf", b: "#0e7490" },   // teal
  sleep:         { a: "#818cf8", b: "#4c1d95" },   // indigo/violet
  anxiety:       { a: "#60a5fa", b: "#1e3a8a" },   // blue
  gateway:       { a: "#c084fc", b: "#581c87" },   // purple
  guided:        { a: "#4ade80", b: "#14532d" },   // green
  selfbelief:    { a: "#fb923c", b: "#7c2d12" },   // coral/orange
  manifestation: { a: "#e879f9", b: "#701a75" },   // magenta
  affirmations:  { a: "#ff6ab0", b: "#831843" },   // pink
  music:         { a: "#f87171", b: "#7f1d1d" },   // crimson
};

export const auraFor = (category) => AURAS[category] || AURAS.calm;

// Inline style for a blurred aura blob (pair with the .aura CSS class)
export const auraStyle = (category, size = 160, opacity = 0.55) => {
  const { a, b } = auraFor(category);
  return {
    width: size,
    height: size,
    opacity,
    background: `radial-gradient(circle at 40% 35%, ${a}, ${b} 70%, transparent)`,
  };
};

// Player bloom colors by audio tone
export const TONE_AURAS = {
  bright:   { a: "#2dd4bf", b: "#065f46" },
  lavender: { a: "#c084fc", b: "#6d28d9" },
  dusk:     { a: "#818cf8", b: "#312e81" },
};
