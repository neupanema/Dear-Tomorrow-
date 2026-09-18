"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Info, X } from "lucide-react";
import Icon from "./Icon";

type Variant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: Variant;
}

interface ToastOptions {
  variant?: Variant;
  /** How long it stays, in ms. Default 3200. */
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;

const VARIANTS: Record<Variant, { glyph: typeof Check; tile: string }> = {
  success: { glyph: Check, tile: "bg-accent text-on-accent" },
  error: { glyph: AlertCircle, tile: "bg-coral text-white" },
  info: { glyph: Info, tile: "bg-sun text-on-sun" },
};

/**
 * Mount once near the root. Anywhere below it, `useToast().toast("...")`
 * shows a snackbar. Because it lives above the router, a toast fired just
 * before navigating stays visible on the next screen.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, { variant = "success", duration = 3200 }: ToastOptions = {}) => {
      const id = nextId.current++;
      setItems((prev) => [...prev, { id, message, variant }].slice(-MAX_VISIBLE));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Clears the mobile bottom nav and FAB; centred on desktop. */}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-36 lg:bottom-8 z-50 flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const { glyph, tile } = VARIANTS[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                role={t.variant === "error" ? "alert" : "status"}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex items-center gap-3 w-full max-w-sm bg-surface text-ink border-2 border-line rounded-2xl pl-2 pr-1 py-2 shadow-[0_12px_28px_-8px_rgba(27,42,74,0.35)]"
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tile}`}>
                  <Icon as={glyph} />
                </span>
                <p className="flex-1 text-body font-bold">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-line transition-colors"
                >
                  <Icon as={X} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
