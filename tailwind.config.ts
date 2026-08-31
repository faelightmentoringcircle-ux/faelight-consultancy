import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — deep forest, twilight purple, firefly gold, parchment
        forest: {
          DEFAULT: "#1d3a2f",
          deep: "#122720",
          light: "#2f5646",
          muted: "#3f6b58",
        },
        twilight: {
          DEFAULT: "#3b2a52",
          deep: "#26183a",
          light: "#5a4480",
        },
        firefly: {
          DEFAULT: "#e6b752",
          bright: "#f4d488",
          deep: "#c9922f",
        },
        parchment: {
          DEFAULT: "#faf6ec",
          warm: "#f4ecd8",
          card: "#fffdf7",
        },
        ink: {
          DEFAULT: "#26221c",
          soft: "#4a443a",
          faint: "#7a7263",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(29,58,47,0.06), 0 8px 24px -12px rgba(29,58,47,0.18)",
        glow: "0 0 40px -6px rgba(230,183,82,0.55)",
        "glow-sm": "0 0 18px -4px rgba(230,183,82,0.6)",
      },
      backgroundImage: {
        "enchanted": "radial-gradient(120% 90% at 15% 10%, #26183a 0%, #1d3a2f 55%, #122720 100%)",
        "firefly-glow": "radial-gradient(closest-side, rgba(230,183,82,0.35), rgba(230,183,82,0))",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.25", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // A sparkle flying along a swirling motion-path (offset-path set inline).
        fairy: {
          "0%": { offsetDistance: "0%", opacity: "0", transform: "scale(0.5)" },
          "12%": { opacity: "1" },
          "50%": { transform: "scale(1.25)" },
          "88%": { opacity: "1" },
          "100%": { offsetDistance: "100%", opacity: "0", transform: "scale(0.5)" },
        },
        // A soft glowing wisp of fairy dust drifting across.
        wisp: {
          "0%": { transform: "translate3d(-15%, 25%, 0) scale(0.9)", opacity: "0" },
          "20%": { opacity: "0.7" },
          "80%": { opacity: "0.45" },
          "100%": { transform: "translate3d(120%, -30%, 0) scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        floatSlow: "floatSlow 7s ease-in-out infinite",
        fadeUp: "fadeUp 0.7s ease-out both",
        fairy: "fairy 10s ease-in-out infinite",
        wisp: "wisp 16s ease-in-out infinite",
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
    },
  },
  plugins: [],
};

export default config;
