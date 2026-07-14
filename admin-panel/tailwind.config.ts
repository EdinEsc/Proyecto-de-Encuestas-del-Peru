import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primario — Azul real (confianza)
        brand: {
          50: "#EFF4FF",
          100: "#DBE6FE",
          200: "#BFD2FD",
          300: "#93B4FA",
          400: "#6091F6",
          500: "#3B76F0",
          600: "#2563EB",
          700: "#1D4FD7",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Secundario — Verde teal (precisión)
        accent: {
          50: "#E6FBF6",
          100: "#C7F6EC",
          200: "#8FEDDA",
          300: "#4FE0C4",
          400: "#14D4AF",
          500: "#00C9A7",
          600: "#00A88C",
          700: "#00866F",
          800: "#086B5B",
          900: "#0B584C",
        },
        // Secundario — Azul noche (elegancia)
        ink: {
          50: "#F5F7FA",
          100: "#E8ECF3",
          200: "#CFD6E4",
          300: "#A6B1C8",
          400: "#6E7C9B",
          500: "#445270",
          600: "#2E3A57",
          700: "#1C2748",
          800: "#131C3B",
          900: "#0B132B",
          950: "#060B1A",
        },
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,19,43,0.04), 0 8px 24px -12px rgba(11,19,43,0.12)",
        "card-hover": "0 2px 4px rgba(11,19,43,0.06), 0 20px 40px -16px rgba(37,99,235,0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
