import type { Config } from "tailwindcss";

// Every palette color is a CSS variable (defined per theme in app/globals.css)
// wrapped so Tailwind's opacity modifiers keep working (bg-sky/50, etc).
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // lib/ holds the mock data whose gradient class names must be generated.
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
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
        // "Doraemon Sky" palette (light) / "Midnight Time Capsule" (dark).
        // The values live in app/globals.css; these names are the single
        // source of truth for components. Change a color there, not in
        // components.
        sky: {
          DEFAULT: token("sky"),
          deep: token("sky-deep"),
        },
        sun: token("sun"),
        coral: token("coral"),
        ink: {
          DEFAULT: token("ink"),
          soft: token("ink-soft"),
        },
        cream: token("cream"),
        line: {
          DEFAULT: token("line"),
          strong: token("line-strong"),
        },

        // Roles that split what used to be one color doing two jobs:
        surface: token("surface"), // cards, headers, nav (was bg-white)
        tint: token("tint"), // soft blue wash behind icons / active rows
        accent: token("accent"), // links, active states, focus (sky-deep -> gold in dark)
        "on-accent": token("on-accent"), // text on an accent fill
        "on-sun": token("on-sun"), // text on a sun/gold fill
        hero: {
          top: token("hero-top"), // full-bleed gradient screens
          bottom: token("hero-bottom"),
        },
        // Fixed (not themed) outline color for the illustrations, which
        // always sit on white/colored fills.
        night: "#1B2A4A",

        // Hand-drawn placeholder map (map page, location picker, empty state).
        map: {
          land: token("map-land"),
          road: token("map-road"),
          park: token("map-park"),
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
