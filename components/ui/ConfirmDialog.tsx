"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import Icon from "@/components/ui/Icon";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  /** Typing this exact word enables the confirm button — for the truly irreversible actions. */
  confirmWord: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * A destructive-action confirmation, styled to match Toast (surface card,
 * rounded-2xl, same shadow). Only used for things that can't be undone —
 * lighter actions don't need typed confirmation, a plain "are you sure?"
 * button pair is enough for those.
 */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  confirmWord,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Autofocus without the `autoFocus` prop, so it also refires if the
    // dialog is reused for a second confirmation without unmounting.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, loading, onClose]);

  const canConfirm = typed.trim().toUpperCase() === confirmWord.toUpperCase();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-ink/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onClick={() => !loading && onClose()}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface rounded-2xl p-5 shadow-[0_20px_40px_-12px_rgba(27,42,74,0.45)]"
          >
            <div className="w-11 h-11 rounded-full bg-coral/15 text-coral flex items-center justify-center mb-3">
              <Icon as={AlertTriangle} size="md" />
            </div>
            <h2 id="confirm-dialog-title" className="font-display text-lead text-ink mb-1">
              {title}
            </h2>
            <div className="text-body text-ink-soft mb-4">{body}</div>

            <label htmlFor="confirm-word" className="field-label mt-0">
              Type {confirmWord} to confirm
            </label>
            <input
              ref={inputRef}
              id="confirm-word"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-surface border-2 border-line-strong rounded-xl px-3 py-2.5 text-body text-ink mb-4 focus:border-coral disabled:opacity-60"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl text-body font-bold text-ink-soft border-2 border-line disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!canConfirm || loading}
                className="flex-1 py-3 rounded-2xl text-body font-bold text-white bg-coral shadow-[0_8px_16px_-6px_rgba(235,78,78,0.5)] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading && <Icon as={Loader2} size="sm" className="animate-spin" />}
                {loading ? "Deleting..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
