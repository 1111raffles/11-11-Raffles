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
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        surface: {
          50:  "#1a1a1a",
          100: "#141414",
          200: "#111111",
          300: "#0d0d0d",
          400: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in":   "slideIn 0.3s ease-out",
        "fade-in":    "fadeIn 0.4s ease-out",
        "ticker":     "ticker 30s linear infinite",
        "glow":       "glow 2s ease-in-out infinite alternate",
        "count-flip": "countFlip 0.3s ease-in-out",
      },
      keyframes: {
        slideIn: {
          "0%":   { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)",     opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glow: {
          "0%":   { boxShadow: "0 0 5px #f59e0b, 0 0 10px #f59e0b" },
          "100%": { boxShadow: "0 0 20px #f59e0b, 0 0 40px #f59e0b, 0 0 60px #f59e0b" },
        },
        countFlip: {
          "0%":   { transform: "rotateX(90deg)", opacity: "0" },
          "100%": { transform: "rotateX(0deg)",  opacity: "1" },
        },
      },
      backgroundImage: {
        "gold-gradient":  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "dark-gradient":  "linear-gradient(180deg, #0a0a0a 0%, #111111 100%)",
        "card-gradient":  "linear-gradient(145deg, #1a1a1a 0%, #111111 100%)",
        "hero-gradient":  "linear-gradient(180deg, transparent 0%, #0a0a0a 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
