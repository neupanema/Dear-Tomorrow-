"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Lock } from "lucide-react";
import UnlockOrb from "@/components/capsules/UnlockOrb";
import CountdownRing from "@/components/capsules/CountdownRing";
import PhotoGallery from "@/components/capsules/PhotoGallery";
import { createClient } from "@/lib/supabase/client";
import { toCapsule, type CapsuleRow } from "@/lib/supabase/capsules";
import { Capsule } from "@/lib/types";
import { getCapsulePhotoUrls } from "@/lib/photos";
import { daysUntil, daysAgo, formatDate } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

export default function CapsuleDetailPage() {
  // useParams (not the `params` prop) — in this Next version the prop is a
  // Promise, which can't be read synchronously in a client component.
  const { id } = useParams<{ id: string }>();
  // undefined = still loading, null = not found (or not this user's capsule —
  // row-level security returns no row for both).
  const [capsule, setCapsule] = useState<Capsule | null | undefined>(undefined);
  // idle: waiting for a tap -> opening: crack + burst -> revealed: the message
  const [phase, setPhase] = useState<"idle" | "opening" | "revealed">("idle");
  // Photos are in a private bucket, so show short-lived signed links.
  // loading -> some urls (ready), or none even though photos exist (error)
  const [photos, setPhotos] = useState<{ state: "loading" | "error" | "ready"; urls: string[] }>({
    state: "loading",
    urls: [],
  });
  const handleOpen = useCallback(() => setPhase("opening"), []);
  const handleOpened = useCallback(() => setPhase("revealed"), []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("capsules")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        setCapsule(error || !data ? null : toCapsule(data as CapsuleRow));
      });
    return () => {
      active = false;
    };
  }, [id]);

  const photoPaths = capsule?.status === "unlocked" ? capsule.photoPaths : [];
  useEffect(() => {
    if (photoPaths.length === 0) return;
    let active = true;
    getCapsulePhotoUrls(createClient(), photoPaths).then((urls) => {
      if (active) setPhotos({ state: urls.length > 0 ? "ready" : "error", urls });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoPaths.join(",")]);

  // The tapped button disappears when the message is revealed, so hand focus
  // to the new heading rather than dropping keyboard/screen-reader users on <body>.
  const revealedHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (phase === "revealed") revealedHeading.current?.focus();
  }, [phase]);

  if (capsule === undefined) return null;
  if (!capsule) return notFound();

  // --- sealed: nothing to tap, it opens itself when the condition is met ---
  if (capsule.status === "sealed") {
    // A date to count down to, unless this is a place-only capsule.
    const hasCountdown = capsule.unlockMethod !== "place" && !!capsule.unlockDate;
    const dateReached = capsule.unlockDate ? daysUntil(capsule.unlockDate) <= 0 : false;
    const place = capsule.unlockLocation?.label;

    const footer =
      capsule.unlockMethod === "place"
        ? `Opens when I return to ${place}`
        : capsule.unlockMethod === "date-and-place"
        ? dateReached
          ? `Just waiting for you to return to ${place}`
          : `And when I return to ${place}`
        : capsule.unlockDate
        ? `Opens ${formatDate(capsule.unlockDate)}`
        : "";

    return (
      <main data-on-sky="" className="min-h-screen bg-hero flex flex-col items-center justify-center text-white text-center px-8 relative">
        <Link
          href="/dashboard"
          className="absolute left-2 top-2 lg:left-6 lg:top-6 p-2 rounded-full text-white"
          aria-label="Back to dashboard"
        >
          <Icon as={ChevronLeft} size="md" />
        </Link>
        {hasCountdown ? (
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4 lg:mb-6"
          >
            <CountdownRing createdAt={capsule.createdAt} unlockDate={capsule.unlockDate!} />
          </motion.div>
        ) : (
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[92px] h-[92px] lg:w-32 lg:h-32 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center mb-4 lg:mb-6"
          >
            <Icon as={Lock} size="xl" className="lg:w-10 lg:h-10" />
          </motion.div>
        )}
        <h1 className="font-display text-heading lg:text-title mb-2">Sealed</h1>
        <p className="text-body lg:text-lead mb-4">
          Something from your past
          <br />
          is waiting for you.
        </p>
        <div className="bg-black/20 px-4 py-2 rounded-full text-caption lg:text-body font-bold">
          {footer}
        </div>
      </main>
    );
  }

  // --- unlocked, not yet revealed: the "tap to open" moment ---
  if (phase !== "revealed") {
    const opening = phase === "opening";
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
        <Link
          href="/dashboard"
          className="absolute left-2 top-2 lg:left-6 lg:top-6 p-2 rounded-full text-ink"
          aria-label="Back to dashboard"
        >
          <Icon as={ChevronLeft} size="md" />
        </Link>
        <p role="status" className="sr-only">
          {opening ? "Opening your capsule..." : ""}
        </p>
        <div className="mb-4 lg:mb-6">
          <UnlockOrb opening={opening} onOpen={handleOpen} onOpened={handleOpened} />
        </div>
        <motion.div
          animate={{ opacity: opening ? 0 : 1, y: opening ? 8 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="font-display text-heading lg:text-title text-ink mb-2">
            Ready to open
          </h1>
          <p className="text-body lg:text-lead text-ink-soft mb-4">
            Take a breath. This is you, {daysAgo(capsule.createdAt)} days ago.
          </p>
          <p className="inline-flex items-center gap-1 text-caption lg:text-body font-bold text-accent">
            Tap to open
            <Icon as={ArrowRight} size="sm" />
          </p>
        </motion.div>
      </main>
    );
  }

  // --- unlocked and revealed: the actual message ---
  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-screen bg-cream flex flex-col items-center lg:justify-center"
    >
      <div className="w-full lg:max-w-lg lg:rounded-3xl lg:overflow-hidden lg:shadow-xl">
        <div data-focus="ink" className="bg-sky px-4 pt-4 pb-4 lg:px-8 lg:pt-8 lg:pb-6 relative">
          <Link
            href="/dashboard"
            className="absolute left-2 top-2 lg:left-6 lg:top-6 p-2 rounded-full text-ink"
            aria-label="Back to dashboard"
          >
            <Icon as={ChevronLeft} size="md" />
          </Link>
          <motion.h1
            ref={revealedHeading}
            tabIndex={-1}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="font-display text-ink text-heading lg:text-title text-center outline-none"
          >
            Your past has
            <br />
            something to tell you
          </motion.h1>
        </div>
        <div className="flex-1 p-4 lg:p-8 bg-surface">
          {capsule.photoPaths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            >
              {photos.state === "ready" ? (
                <PhotoGallery urls={photos.urls} />
              ) : photos.state === "error" ? (
                <div className="h-56 lg:h-72 rounded-2xl mb-3 bg-tint flex items-center justify-center">
                  <p className="text-caption text-ink-soft px-4 text-center">
                    Couldn&apos;t load your photos. Try reopening this capsule.
                  </p>
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="h-56 lg:h-72 rounded-2xl mb-3 animate-pulse bg-line"
                />
              )}
            </motion.div>
          )}
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
    </motion.main>
  );
}
