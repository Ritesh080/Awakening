// Hand-drawn-style line illustrations in the spirit of the reference design.
// Ink strokes on transparent, with soft lavender/pink accent shapes.

const INK = "#dfe3f4";
const LAV = "#322c5a";
const PINK = "#ff4fa3";

function Base({ children, accent }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
      {accent}
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

const Lotus = () => (
  <Base accent={<circle cx="62" cy="52" r="30" fill={LAV} opacity="0.7" />}>
    <circle cx="60" cy="38" r="9" fill="#12121a" />
    <path d="M52 34c-3-6 1-13 8-14 7 1 11 8 8 14" fill={INK} />
    <path d="M60 47v14M45 55c4 5 9 8 15 8s11-3 15-8" />
    <path d="M38 78c6-10 13-16 22-16s16 6 22 16" />
    <path d="M30 84c8 2 18 4 30 4s22-2 30-4" />
    <path d="M22 88c5 6 13 9 20 7M98 88c-5 6-13 9-20 7" />
    <path d="M47 55c-3-4-2-9 2-11M73 55c3-4 2-9-2-11" />
  </Base>
);

const Swing = () => (
  <Base accent={<circle cx="58" cy="60" r="34" fill={LAV} opacity="0.7" />}>
    <path d="M28 18l14 26M92 18l-14 26" />
    <path d="M40 46h40" />
    <circle cx="60" cy="34" r="8" fill="#12121a" />
    <path d="M53 30c-2-5 2-10 7-10s9 5 7 10" fill={INK} />
    <path d="M60 44v14M52 52l8 6 9-5" />
    <path d="M60 58l-10 16M60 58l12 14" />
    <path d="M46 80c4 3 9 5 14 5s10-2 14-5" />
  </Base>
);

const Skate = () => (
  <Base accent={<circle cx="60" cy="56" r="32" fill={LAV} opacity="0.7" />}>
    <circle cx="68" cy="26" r="8" fill="#12121a" />
    <path d="M61 22c-2-5 2-10 7-10s9 5 7 10" fill={INK} />
    <path d="M66 34l-8 18 12 8-4 18M58 52l-16 6M70 60l16-4" />
    <path d="M62 78l-6 14M66 78l8 12" />
    <path d="M50 96h12M70 94h12" />
    <circle cx="54" cy="99" r="2.5" /><circle cx="60" cy="99" r="2.5" />
    <circle cx="74" cy="97" r="2.5" /><circle cx="80" cy="97" r="2.5" />
  </Base>
);

const Moon = () => (
  <Base accent={<circle cx="64" cy="54" r="32" fill={LAV} opacity="0.7" />}>
    <path d="M74 26c-12 2-22 13-22 27s10 25 22 27c-18 6-38-6-38-27s20-33 38-27z" fill="#12121a" />
    <path d="M84 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill={PINK} stroke="none" />
    <circle cx="90" cy="62" r="2.5" fill={INK} stroke="none" />
    <circle cx="28" cy="40" r="2" fill={INK} stroke="none" />
  </Base>
);

const Cloud = () => (
  <Base accent={<circle cx="60" cy="58" r="32" fill={LAV} opacity="0.7" />}>
    <path d="M36 66c-8 0-14-6-14-13s6-13 13-13c2-9 10-15 19-15 10 0 18 7 20 16 8 0 14 6 14 13s-6 12-14 12H36z" fill="#12121a" />
    <path d="M40 78l-3 8M56 78l-3 8M72 78l-3 8M88 78l-3 8" stroke={PINK} />
  </Base>
);

const Leaf = () => (
  <Base accent={<circle cx="60" cy="58" r="32" fill={LAV} opacity="0.7" />}>
    <path d="M60 92c-22-10-28-34-16-54 22 2 36 20 32 44-4 5-10 9-16 10z" fill="#12121a" />
    <path d="M58 88c-2-18 0-34 8-46" />
    <path d="M58 72c-5-2-9-6-11-11M62 58c5-1 9-4 12-8" />
  </Base>
);

const Mountain = () => (
  <Base accent={<circle cx="60" cy="58" r="34" fill={LAV} opacity="0.7" />}>
    <path d="M22 86l24-44 14 24 10-16 18 36H22z" fill="#12121a" />
    <path d="M46 42l6 10-6 6-6-6 6-10z" fill={PINK} stroke="none" />
    <circle cx="84" cy="34" r="7" fill={PINK} stroke="none" />
  </Base>
);

const Column = () => (
  <Base accent={<circle cx="60" cy="56" r="32" fill={LAV} opacity="0.7" />}>
    <circle cx="60" cy="30" r="8" fill="#12121a" />
    <path d="M60 40v40" />
    <ellipse cx="60" cy="58" rx="20" ry="8" />
    <ellipse cx="60" cy="70" rx="28" ry="10" />
    <path d="M60 84c-3 4-3 8 0 12" stroke={PINK} />
  </Base>
);

const Spiral = () => (
  <Base accent={<circle cx="60" cy="58" r="32" fill={LAV} opacity="0.7" />}>
    <path d="M60 58c0-3 3-5 6-4s5 5 3 9-8 7-13 5-9-9-6-16 12-11 20-8 13 13 9 22-15 13-25 9" fill="none" />
    <circle cx="60" cy="58" r="2.5" fill={PINK} stroke="none" />
  </Base>
);

const Rain = () => (
  <Base accent={<circle cx="60" cy="54" r="32" fill={LAV} opacity="0.7" />}>
    <path d="M38 58c-7 0-12-5-12-11s5-11 11-11c2-8 9-13 17-13 9 0 16 6 17 14 7 0 12 5 12 11s-5 10-12 10H38z" fill="#12121a" />
    <path d="M42 68c-3 5-3 8 0 10s7 0 7-4-3-7-7-6zM62 72c-3 5-3 8 0 10s7 0 7-4-3-7-7-6zM82 66c-3 5-3 8 0 10s7 0 7-4-3-7-7-6z" fill={PINK} stroke="none" />
  </Base>
);

const Waves = () => (
  <Base accent={<circle cx="60" cy="58" r="32" fill={LAV} opacity="0.7" />}>
    <path d="M24 50c8-8 16-8 24 0s16 8 24 0 16-8 24 0" />
    <path d="M24 64c8-8 16-8 24 0s16 8 24 0 16-8 24 0" />
    <path d="M24 78c8-8 16-8 24 0s16 8 24 0 16-8 24 0" stroke={PINK} />
  </Base>
);

const Star = () => (
  <Base accent={<circle cx="60" cy="58" r="32" fill={LAV} opacity="0.7" />}>
    <path d="M60 28l7 18 19 2-14 13 4 19-16-10-16 10 4-19-14-13 19-2 7-18z" fill="#12121a" />
    <circle cx="88" cy="34" r="2.5" fill={PINK} stroke="none" />
    <circle cx="30" cy="44" r="2" fill={PINK} stroke="none" />
    <circle cx="86" cy="80" r="2" fill={PINK} stroke="none" />
  </Base>
);

const MAP = {
  lotus: Lotus, swing: Swing, skate: Skate, moon: Moon, cloud: Cloud,
  leaf: Leaf, mountain: Mountain, column: Column, spiral: Spiral,
  rain: Rain, waves: Waves, star: Star,
};

export default function Illustration({ name, className = "" }) {
  const Comp = MAP[name] || Lotus;
  return (
    <div className={className}>
      <Comp />
    </div>
  );
}
