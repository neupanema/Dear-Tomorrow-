"use client";

import { Moon, Sun } from "lucide-react";
import Icon from "./Icon";
import { useTheme } from "./ThemeProvider";

/**
 * Switch for light / dark. The icon is chosen with CSS (dark: variants) so it
 * is correct on first paint, even before React knows the theme.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Dark mode"
      onClick={toggleTheme}
      className={`relative w-12 h-7 shrink-0 rounded-full bg-line-strong dark:bg-accent transition-colors ${className}`}
    >
      <span
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-surface dark:bg-on-accent text-accent dark:text-accent flex items-center justify-center transition-transform dark:translate-x-5"
      >
        <Icon as={Sun} className="hidden dark:block !w-3 !h-3" />
        <Icon as={Moon} className="dark:hidden !w-3 !h-3 text-ink-soft" />
      </span>
    </button>
  );
}
