"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share, X } from "lucide-react";
import BrandMark from "@/components/ui/BrandMark";
import Icon from "@/components/ui/Icon";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const DISMISS_KEY = "dt-install-dismissed-at";
const SNOOZE_DAYS = 14;

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return !!raw && Date.now() - Number(raw) < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    // Storage can be blocked (private mode) — just don't remember the dismissal.
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Nothing to do — worst case the banner shows again next visit.
  }
}

/**
 * "Add to home screen" banner. Chrome/Edge/Android can install directly
 * (the `beforeinstallprompt` event); iOS Safari has no such API, so it gets
 * a short instruction instead. Neither path nags: dismissing either one
 * hides it for two weeks, and it never shows once the app is already
 * installed (running in its own window).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || wasRecentlyDismissed()) return;

    function onBeforeInstall(e: BeforeInstallPromptEvent) {
      e.preventDefault(); // stop Chrome's automatic mini-infobar; we show our own banner instead
      setDeferred(e);
      setPlatform("android");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS/iPadOS never fires beforeinstallprompt — "Add to Home Screen" only
    // exists behind the Share sheet, so just point at it after a short delay
    // (long enough that it isn't the first thing someone sees on load).
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
      iosTimer = setTimeout(() => setPlatform("ios"), 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  useEffect(() => {
    if (platform) setVisible(true);
  }, [platform]);

  function dismiss() {
    setVisible(false);
    markDismissed();
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  if (!platform) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-label="Install Dear Tomorrow"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24, transition: { duration: 0.15 } }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed z-40 inset-x-4 bottom-20 lg:inset-x-auto lg:left-6 lg:bottom-6 lg:w-80 bg-surface border-2 border-line rounded-2xl p-3 shadow-[0_12px_28px_-8px_rgba(27,42,74,0.35)] flex items-start gap-3"
        >
          <BrandMark />
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-bold text-body text-ink leading-snug">
              Add Dear Tomorrow to your home screen
            </p>
            <p className="text-caption text-ink-soft mt-0.5">
              {platform === "android"
                ? "Open it like an app, straight from your home screen."
                : "Tap the Share icon below, then “Add to Home Screen.”"}
            </p>
            <div className="flex items-center gap-4 mt-2">
              {platform === "android" ? (
                <button type="button" onClick={install} className="text-caption font-bold text-accent">
                  Install
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-caption font-bold text-accent">
                  <Icon as={Share} size="sm" />
                  Share menu
                </span>
              )}
              <button type="button" onClick={dismiss} className="text-caption font-bold text-ink-soft">
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-ink-soft p-1 -m-1 shrink-0"
          >
            <Icon as={X} size="sm" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
