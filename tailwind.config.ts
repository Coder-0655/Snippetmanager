import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(222 22% 8%)", // Rich dark navy
        foreground: "hsl(213 18% 96%)", // Soft white
        muted: {
          DEFAULT: "hsl(222 15% 11%)",
          foreground: "hsl(215 16% 68%)",
        },
        card: {
          DEFAULT: "hsl(222 18% 9%)",
          foreground: "hsl(213 18% 96%)",
        },
        border: "hsl(221 39% 18%)", // Subtle indigo border
        input: "hsl(222 15% 14%)",
        ring: "hsl(221 83% 53%)", // Professional indigo focus
        primary: {
          DEFAULT: "hsl(221 83% 53%)", // Professional indigo
          foreground: "white",
          50: "hsl(224 76% 97%)",
          100: "hsl(225 71% 93%)",
          200: "hsl(224 64% 87%)",
          300: "hsl(224 62% 78%)",
          400: "hsl(224 56% 67%)",
          500: "hsl(221 83% 53%)",
          600: "hsl(221 100% 44%)",
          700: "hsl(222 100% 39%)",
          800: "hsl(223 88% 34%)",
          900: "hsl(224 88% 28%)",
        },
        secondary: {
          DEFAULT: "hsl(215 25% 27%)", // Slate secondary
          foreground: "hsl(213 18% 96%)",
          50: "hsl(210 40% 98%)",
          100: "hsl(210 40% 96%)",
          200: "hsl(214 32% 91%)",
          300: "hsl(213 27% 84%)",
          400: "hsl(215 20% 65%)",
          500: "hsl(215 16% 47%)",
          600: "hsl(215 19% 35%)",
          700: "hsl(215 25% 27%)",
          800: "hsl(217 33% 17%)",
          900: "hsl(222 84% 5%)",
        },
        accent: {
          DEFAULT: "hsl(264 83% 70%)", // Unique purple accent
          foreground: "white",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "white",
        },
        success: {
          DEFAULT: "hsl(142 76% 36%)",
          foreground: "white",
        },
        warning: {
          DEFAULT: "hsl(38 92% 50%)",
          foreground: "hsl(222 22% 8%)",
        },
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(221 83% 53% / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px hsl(221 83% 53% / 0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
        "slide-up": "slide-up 300ms ease-out",
        "slide-down": "slide-down 300ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        "shimmer": "shimmer 2s infinite",
        "pulse-glow": "pulse-glow 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
