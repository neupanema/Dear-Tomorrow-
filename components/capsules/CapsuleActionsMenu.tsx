"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Archive, ArchiveRestore, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";
import Icon from "@/components/ui/Icon";

interface CapsuleActionsMenuProps {
  /** Present only while the capsule is still sealed — editing after unlock isn't offered. */
  editHref?: string;
  archived: boolean;
  archiving?: boolean;
  onArchiveToggle: () => void;
  onDelete: () => void;
  onShare: () => void;
  /** Text color of the trigger button — the sealed screen is on a dark background, others are light. */
  triggerClassName?: string;
}

/** Owner-only "..." menu for editing, sharing, archiving, or deleting a capsule. */
export default function CapsuleActionsMenu({
  editHref,
  archived,
  archiving,
  onArchiveToggle,
  onDelete,
  onShare,
  triggerClassName = "text-ink",
}: CapsuleActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Capsule actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`p-2 rounded-full ${triggerClassName}`}
      >
        <Icon as={MoreVertical} size="md" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-48 bg-surface border border-line rounded-xl shadow-[0_12px_28px_-8px_rgba(27,42,74,0.35)] py-1 z-10 overflow-hidden"
        >
          {editHref && (
            <Link
              role="menuitem"
              href={editHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-body text-ink"
            >
              <Icon as={Pencil} size="sm" />
              Edit
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onShare();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-body text-ink"
          >
            <Icon as={Share2} size="sm" />
            Share
          </button>
          <button
            role="menuitem"
            type="button"
            disabled={archiving}
            onClick={() => {
              setOpen(false);
              onArchiveToggle();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-body text-ink disabled:opacity-60"
          >
            <Icon as={archived ? ArchiveRestore : Archive} size="sm" />
            {archived ? "Unarchive" : "Archive"}
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-body text-coral"
          >
            <Icon as={Trash2} size="sm" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
