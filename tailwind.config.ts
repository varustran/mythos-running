import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        subtle: "rgb(var(--subtle) / <alpha-value>)",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
        teal: {
          DEFAULT: "rgb(var(--teal) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Noto Sans", "Noto Sans JP", "Noto Sans SC", "sans-serif"],
        display: ["var(--font-display)", "Sora", "Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      maxWidth: {
        content: "76rem",
        prose: "44rem",
      },
      boxShadow: {
        card: "0 1px 2px rgb(8 13 22 / 0.04), 0 12px 32px -12px rgb(8 13 22 / 0.18)",
        lift: "0 24px 60px -24px rgb(8 13 22 / 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-line": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-line": "pulse-line 4s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
