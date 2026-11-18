import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

// Tokens de NEXZUS IT SERVICE (ver design-system/nexzus-it-service/MASTER.md).
// `line` es el token de borde (`border` choca con la utilidad de Tailwind).
const brand = {
  primary: "#0B0712",
  secondary: "#1A1030",
  accent: "#7C3AED",
  "accent-hover": "#6D28D9",
  "accent-light": "#A78BFA",
  "accent-soft": "#EDE9FE",
  background: "#F8F7FB",
  foreground: "#0B0712",
  card: "#FFFFFF",
  muted: "#EEEBF5",
  "muted-foreground": "#4B4560",
  line: "#E4E0EE",
  destructive: "#DC2626",
  success: "#15803D",
  warning: "#B45309",
};

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: brand,
      fontFamily: {
        sans: ["Source Sans 3", "system-ui", "sans-serif"],
        heading: ["Lexend", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#F8F7FB",
            foreground: "#0B0712",
            primary: { DEFAULT: "#0B0712", foreground: "#FFFFFF" },
            secondary: { DEFAULT: "#1A1030", foreground: "#FFFFFF" },
            success: { DEFAULT: "#15803D", foreground: "#FFFFFF" },
            warning: { DEFAULT: "#B45309", foreground: "#FFFFFF" },
            danger: { DEFAULT: "#DC2626", foreground: "#FFFFFF" },
            focus: "#7C3AED",
          },
        },
      },
    }),
  ],
};
export default config;
