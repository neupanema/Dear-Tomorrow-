"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

// Client-side providers that wrap the whole app. `reducedMotion="user"` makes
// every framer-motion animation drop its movement (keeping fades) for people
// who've turned on "reduce motion" in their OS settings.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
