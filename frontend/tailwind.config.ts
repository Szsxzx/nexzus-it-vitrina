import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta INCODOL / Carnicería
        rojo:        "#8B0000",
        "rojo-mid":  "#a50000",
        "rojo-light":"#c0392b",
        azul:        "#3AA8C1",
        "azul-dark": "#2d8ba0",
        crema:       "#faf8f5",
        negro:       "#0f0f0f",
        negro2:      "#1a1a1a",
        negro3:      "#242424",
      },
      fontFamily: {
        sans:  ["DM Sans", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
