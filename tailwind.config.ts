import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(220 14% 7%)", // near-black GitHub dark
        foreground: "hsl(210 40% 98%)",
        muted: {
          DEFAULT: "hsl(220 9% 12%)",
          foreground: "hsl(215 20% 65%)",
        },
        card: {
          DEFAULT: "hsl(220 9% 10%)",
          foreground: "hsl(210 40% 98%)",
        },
        border: "hsl(220 9% 20%)",
        input: "hsl(220 9% 16%)",
        ring: "hsl(230 100% 67%)",
        primary: {
          DEFAULT: "hsl(226 70% 60%)", // indigo/blue accent
          foreground: "white",
        },
        secondary: {
          DEFAULT: "hsl(220 9% 14%)",
          foreground: "hsl(210 40% 98%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "white",
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
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
