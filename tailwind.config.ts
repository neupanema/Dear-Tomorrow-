import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Doraemon Sky" palette — keep these as the single source of truth
        // for color across the app. Change them here, not in components.
        sky: {
          DEFAULT: "#3FA9F5",
          deep: "#1E7FD1",
        },
        sun: "#FFD34D",
        coral: "#EB4E4E",
        ink: {
          DEFAULT: "#1B2A4A",
          soft: "#5B6B8C",
        },
        cream: "#FFF8EC",
        line: "#EAF0FA",
        // Hand-drawn placeholder map (map page, location picker, empty state).
        map: {
          land: "#DCEFE0",
          road: "#F5F1DD",
          park: "#C9E3D0",
        },
      },
      fontFamily: {
        display: ["var(--font-baloo)", "cursive"],
        body: ["var(--font-nunito)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
