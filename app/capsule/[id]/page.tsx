"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Lock } from "lucide-react";
import UnlockOrb from "@/components/capsules/UnlockOrb";
import { getCapsuleById } from "@/lib/mock-data";
import { formatDate, daysAgo } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

export default function CapsuleDetailPage() {
  // useParams (not the `params` prop) — in this Next version the prop is a
  // Promise, which can't be read synchronously in a client component.
  const { id } = useParams<{ id: string }>();
  const capsule = getCapsuleById(id);
  // idle: waiting for a tap -> opening: crack + burst -> revealed: the message
  const [phase, setPhase] = useState<"idle" | "opening" | "revealed">("idle");
  const handleOpen = useCallback(() => setPhase("opening"), []);
  const handleOpened = useCallback(() => setPhase("revealed"), []);

  if (!capsule) return notFound();

  // --- sealed: nothing to tap, it opens itself when the condition is met ---
  if (capsule.status === "sealed") {
    return (
      <div className="min-h-screen bg-gradient-to-b lg:bg-gradient-to-br from-sky to-sky-deep flex flex-col items-center justify-center text-white text-center px-8 relative">
        <Link
          href="/dashboard"
          className="absolute left-4 top-4 lg:left-8 lg:top-8 text-white"
          aria-label="Back to dashboard"
        >
          <Icon as={ChevronLeft} size="md" />
        </Link>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[92px] h-[92px] lg:w-32 lg:h-32 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center mb-4 lg:mb-6"
        >
          <Icon as={Lock} size="xl" className="lg:w-10 lg:h-10" />
        </motion.div>
        <h2 className="font-display text-heading lg:text-title mb-2">Sealed</h2>
        <p className="text-body lg:text-lead opacity-90 mb-4">
          Something from your past
          <br />
          is waiting for you.
        </p>
        <div className="bg-white/18 px-4 py-2 rounded-full text-caption lg:text-body font-bold">
          {capsule.unlockMethod === "place"
            ? `Opens when I return to ${capsule.unlockLocation?.label}`
            : `Opens ${capsule.unlockDate ? formatDate(capsule.unlockDate) : ""}`}
        </div>
      </div>
    );
  }

  // --- unlocked, not yet revealed: the "tap to open" moment ---
  if (phase !== "revealed") {
    const opening = phase === "opening";
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
        <Link
          href="/dashboard"
          className="absolute left-4 top-4 lg:left-8 lg:top-8 text-ink"
          aria-label="Back to dashboard"
        >
          <Icon as={ChevronLeft} size="md" />
        </Link>
        <div className="mb-4 lg:mb-6">
          <UnlockOrb opening={opening} onOpen={handleOpen} onOpened={handleOpened} />
        </div>
        <motion.div
          animate={{ opacity: opening ? 0 : 1, y: opening ? 8 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="font-display text-heading lg:text-title text-ink mb-2">
            Ready to open
          </h2>
          <p className="text-body lg:text-lead text-ink-soft mb-4">
            Take a breath. This is you, {daysAgo(capsule.createdAt)} days ago.
          </p>
          <p className="inline-flex items-center gap-1 text-caption lg:text-body font-bold text-sky-deep">
            Tap to open
            <Icon as={ArrowRight} size="sm" />
          </p>
        </motion.div>
      </div>
    );
  }

  // --- unlocked and revealed: the actual message ---
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-screen bg-cream flex flex-col items-center lg:justify-center"
    >
      <div className="w-full lg:max-w-lg lg:rounded-3xl lg:overflow-hidden lg:shadow-xl">
        <div className="bg-sky px-4 pt-4 pb-4 lg:px-8 lg:pt-8 lg:pb-6 relative">
          <Link
            href="/dashboard"
            className="absolute left-4 top-4 lg:left-8 lg:top-8 text-white"
            aria-label="Back to dashboard"
          >
            <Icon as={ChevronLeft} size="md" />
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="font-display text-white text-heading lg:text-title text-center"
          >
            Your past has
            <br />
            something to tell you
          </motion.h1>
        </div>
        <div className="flex-1 p-4 lg:p-8 bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            className={`h-32 lg:h-56 rounded-2xl mb-3 bg-gradient-to-br ${capsule.photoGradient} flex items-center justify-center text-white text-body font-bold`}
          >
            Your photo from that day
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-cream rounded-2xl p-3 lg:p-5 border-l-4 border-sun text-lead text-ink"
          >
            &ldquo;{capsule.message}&rdquo;
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            className="text-caption text-ink-soft text-center mt-2 lg:mt-3"
          >
            Written {daysAgo(capsule.createdAt)} days ago
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
