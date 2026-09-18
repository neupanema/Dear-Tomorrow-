import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Type scale. This REPLACES Tailwind's default text-xs/sm/base/... on
    // purpose, so every size in the app comes from these seven tiers and a
    // stray text-sm can't sneak back in. Each tier carries its own
    // line-height, so pages don't need leading-* utilities.
    fontSize: {
      micro: ["10px", "14px"], // badges, nav labels
      caption: ["11px", "16px"], // field labels, meta text
      body: ["13px", "20px"], // default UI text, list rows, chips
      lead: ["16px", "24px"], // buttons, inputs, hero paragraphs
      heading: ["20px", "26px"], // page + empty-state titles
      title: ["24px", "30px"], // hero / status titles
      display: ["32px", "38px"], // desktop hero titles
    },
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
