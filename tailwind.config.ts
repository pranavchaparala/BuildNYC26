import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cool, near-white app background (Linear/Mercury style)
        canvas: "#F7F8FA",
        // Cool slate neutral scale
        ink: {
          DEFAULT: "#16181D",
          50: "#F6F7F9",
          100: "#ECEEF1",
          200: "#DDE0E5",
          300: "#C2C7CF",
          400: "#9298A3",
          500: "#6B7280",
          600: "#4B515B",
          700: "#363B43",
          800: "#23272E",
          900: "#16181D",
        },
        // Refined indigo accent
        accent: {
          DEFAULT: "#5E6AD2",
          light: "#8B93E8",
          dark: "#4A55BE",
        },
        strong: "#16A34A",
        wasted: "#DC2626",
        unconsidered: "#D97706",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        "card-hover": "0 2px 4px rgba(16, 24, 40, 0.05), 0 4px 12px rgba(16, 24, 40, 0.08)",
        popover: "0 4px 6px rgba(16, 24, 40, 0.04), 0 12px 32px rgba(16, 24, 40, 0.14)",
        btn: "0 1px 2px rgba(16, 24, 40, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      animation: {
        "scan": "scan 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.4s ease forwards",
        "count-up": "countUp 0.4s ease forwards",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
