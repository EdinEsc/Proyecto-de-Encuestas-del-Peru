import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /*
          Escala primaria. Se mantiene el nombre `brand` porque lo usan ~60
          sitios, pero los valores ya no son el azul genérico anterior: la rampa
          va del azul eléctrico de marca (#1677FF) al azul marino (#0B1F3A).
        */
        brand: {
          50: "#F4F7FA",
          100: "#E8F1FF",
          200: "#CFE2FF",
          300: "#6FA8FF",
          400: "#3E8CFF", // texto sobre fondo oscuro
          500: "#1677FF", // azul eléctrico — datos y acentos finos
          600: "#0B1F3A", // azul marino — rellenos principales
          700: "#16325C", // hover: marino aclarado, para que el cambio se note
          800: "#0E2647",
          900: "#071528",
        },
        /*
          Secundario. Antes era un verde teal ajeno a la marca; ahora es el
          amarillo dorado de identidad.
        */
        accent: {
          50: "#FEF7DC",
          100: "#FDEFB8",
          200: "#FBE382",
          300: "#F8D64C",
          400: "#F6CD2E",
          500: "#F5C518",
          600: "#DBAE0B",
          700: "#A88400",
          800: "#7D6200",
          900: "#5C4800",
        },
        // Éxito / métricas positivas — Verde neón (crecimiento)
        neon: {
          50: "#F4FFE0",
          100: "#E8FFC2",
          200: "#D6FF8F",
          300: "#C2FF57",
          400: "#B0FF2E",
          500: "#A3FF12",
          600: "#84D600",
          700: "#63A200",
          800: "#4A7A05",
          900: "#3B610A",
        },
        // Secundario / tecnológico — Púrpura (innovación)
        plum: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        // Texto secundario, bordes — Gris acero (equilibrio)
        steel: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        /*
          Paleta institucional. Cada token corresponde a una fila de la tabla
          de marca; los sufijos -hover y -soft son derivados que hacían falta
          para estados interactivos y fondos tenues.
        */
        navy: {
          DEFAULT: "#0B1F3A", // Principal — azul marino profundo
          light: "#16325C",
          dark: "#071528",
        },
        electric: {
          DEFAULT: "#1677FF", // Tecnología / datos — azul eléctrico
          hover: "#0E5FD8",
          soft: "#E8F1FF",
        },
        gold: {
          DEFAULT: "#F5C518", // Identidad / acento — amarillo dorado
          hover: "#DBAE0B",
          soft: "#FEF7DC",
        },
        carbon: "#20252B", // Texto — gris carbón
        mist: "#F4F7FA", // Fondo secundario — gris muy claro

        // Blanco de la marca
        paper: "#F8FAFC",
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
