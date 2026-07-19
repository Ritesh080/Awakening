/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Dark neon-glass palette (token names kept from the light theme so
        // existing components restyle automatically)
        haze: "#060608",       // page background (near black)
        card: "#0e0e13",       // app surface
        cardsoft: "#1a1a23",   // raised soft surface
        tile: "#16161f",       // bento tile
        ink: "#f2f2f7",        // primary text (light)
        inkmuted: "#8f8f9f",
        blush: "#331327",      // deep magenta chip bg
        rose: "#ff6ab0",
        rosedeep: "#ff4fa3",   // hot pink accent
        lavender: "#1e1b36",   // violet glass card
        lavdeep: "#2f2a58",
        neon: "#d9ff4f",       // electric yellow accent
      },
      fontFamily: {
        display: ["Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        sans: ["Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        dot: ["Doto", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        card: "0 24px 60px -20px rgba(0, 0, 0, 0.9)",
        soft: "0 8px 24px -10px rgba(0, 0, 0, 0.7)",
        orb: "0 0 90px -10px rgba(255, 79, 163, 0.5)",
        neon: "0 0 40px -8px rgba(217, 255, 79, 0.45)",
      },
    },
  },
  plugins: [],
}
