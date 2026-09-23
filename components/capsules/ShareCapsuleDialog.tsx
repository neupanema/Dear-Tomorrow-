"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mail, X } from "lucide-react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { inviteToCapsule, listSharesForCapsule, revokeShare, type CapsuleShare } from "@/lib/supabase/shares";
import type { Capsule } from "@/lib/types";

interface ShareCapsuleDialogProps {
  open: boolean;
  capsule: Capsule;
  onClose: () => void;
}

const STATUS_LABEL: Record<CapsuleShare["status"], string> = {
  pending: "Invited",
  accepted: "Accepted",
  revoked: "Revoked",
};

/** Owner-only: invite a capsule to someone by email, and manage existing invites. */
export default function ShareCapsuleDialog({ open, capsule, onClose }: ShareCapsuleDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [shares, setShares] = useState<CapsuleShare[] | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setShares(null);
    listSharesForCapsule(createClient(), capsule.id)
      .then(setShares)
      .catch((err) => toast((err as Error).message, { variant: "error" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, capsule.id]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || inviting) return;
    setInviting(true);
    try {
      const supabase = createClient();
      await inviteToCapsule(supabase, capsule, email);
      setEmail("");
      setShares(await listSharesForCapsule(supabase, capsule.id));
      toast("Invite sent");
    } catch (err) {
      toast((err as Error).message, { variant: "error" });
    } finally {
      setInviting(false);
    }
  }

  async function handleRevoke(shareId: string) {
    if (revokingId) return;
    setRevokingId(shareId);
    try {
      const supabase = createClient();
      await revokeShare(supabase, shareId);
      setShares(await listSharesForCapsule(supabase, capsule.id));
    } catch (err) {
      toast((err as Error).message, { variant: "error" });
    } finally {
      setRevokingId(null);
    }
  }

  const activeShares = (shares ?? []).filter((s) => s.status !== "revoked");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-ink/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface rounded-2xl p-5 shadow-[0_20px_40px_-12px_rgba(27,42,74,0.45)]"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 id="share-dialog-title" className="font-display text-lead text-ink">
                Share this capsule
              </h2>
              <button type="button" onClick={onClose} aria-label="Close" className="p-1 -m-1 text-ink-soft">
                <Icon as={X} size="sm" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <Icon as={Mail} size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
                <label htmlFor="invite-email" className="sr-only">Email address</label>
                <input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Their email address"
                  disabled={inviting}
                  className="w-full bg-cream border-2 border-line rounded-xl pl-9 pr-3 py-2.5 text-body text-ink focus:border-accent disabled:opacity-60"
                />
              </div>
              <Button type="submit" loading={inviting} disabled={inviting || !email.trim()} className="!w-auto !py-2.5 !px-4">
                Invite
              </Button>
            </form>

            {shares === null ? (
              <div className="flex justify-center py-4">
                <Icon as={Loader2} size="md" className="animate-spin text-ink-soft" />
              </div>
            ) : activeShares.length === 0 ? (
              <p className="text-caption text-ink-soft text-center py-2">Not shared with anyone yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {activeShares.map((share) => (
                  <li
                    key={share.id}
                    className="flex items-center justify-between gap-2 bg-cream rounded-xl px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-body text-ink truncate">{share.invitedEmail}</p>
                      <p className="text-caption text-ink-soft">{STATUS_LABEL[share.status]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevoke(share.id)}
                      disabled={revokingId === share.id}
                      className="text-caption font-bold text-coral shrink-0 disabled:opacity-60"
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
