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
        // Renamed to "gold" to avoid changing all class names — now purple/blue
        gold: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",   // light purple — used for text accents
          500: "#8b5cf6",   // main purple — used for buttons
          600: "#7c3aed",   // deep purple — hover states
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        // Blue accent for gradients / secondary elements
        brand: {
          blue:   "#3b82f6",
          purple: "#8b5cf6",
          light:  "#a78bfa",
          dark:   "#6d28d9",
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
          "0%":   { boxShadow: "0 0 5px #8b5cf6, 0 0 10px #3b82f6" },
          "100%": { boxShadow: "0 0 20px #8b5cf6, 0 0 40px #3b82f6, 0 0 60px #8b5cf6" },
        },
        countFlip: {
          "0%":   { transform: "rotateX(90deg)", opacity: "0" },
          "100%": { transform: "rotateX(0deg)",  opacity: "1" },
        },
      },
      backgroundImage: {
        "gold-gradient":  "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
        "dark-gradient":  "linear-gradient(180deg, #0a0a0a 0%, #111111 100%)",
        "card-gradient":  "linear-gradient(145deg, #1a1a1a 0%, #111111 100%)",
        "hero-gradient":  "linear-gradient(180deg, transparent 0%, #0a0a0a 100%)",
        "brand-gradient": "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
