"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, MapPin, Sparkles } from "lucide-react";
import { Capsule } from "@/lib/types";
import { daysUntil, formatCountdown } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

const MotionLink = motion.create(Link);

function badge(capsule: Capsule) {
  if (capsule.status === "unlocked") {
    return { icon: Sparkles, bg: "bg-coral" };
  }
  if (capsule.unlockMethod === "place") {
    return { icon: MapPin, bg: "bg-sun text-on-sun" };
  }
  return { icon: Lock, bg: "bg-sky-deep" };
}

function subtitle(capsule: Capsule) {
  if (capsule.status === "unlocked") return "Ready to open now";
  if (capsule.unlockMethod === "place")
    return `Opens when I return to ${capsule.unlockLocation?.label ?? "this place"}`;
  if (capsule.unlockDate) {
    const place = capsule.unlockLocation?.label ?? "that place";
    if (capsule.unlockMethod === "date-and-place" && daysUntil(capsule.unlockDate) <= 0) {
      return `Waiting for you at ${place}`;
    }
    const countdown = formatCountdown(capsule.unlockDate);
    return capsule.unlockMethod === "date-and-place" ? `${countdown} · at ${place}` : countdown;
  }
  return "Sealed";
}

// Cards fade + rise in one after another. `custom` carries the card's
// position so the stagger also works for cards re-entering after a filter.
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" as const, delay: i * 0.07 },
  }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.16 } },
};

export default function CapsuleCard({
  capsule,
  index = 0,
}: {
  capsule: Capsule;
  index?: number;
}) {
  const { icon: Glyph, bg } = badge(capsule);

  return (
    <MotionLink
      href={`/capsule/${capsule.id}`} // sealed capsules also route here and show the waiting screen
      layout
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate="show"
      exit="exit"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="card flex items-center gap-3 mb-3 lg:mb-0 lg:p-4 transition-colors hover:border-accent"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${bg}`}
      >
        <Icon as={Glyph} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-body text-ink truncate">{capsule.title}</p>
        <p className="text-caption text-ink-soft mt-1">{subtitle(capsule)}</p>
      </div>
      {capsule.status === "unlocked" && (
        <span className="text-micro font-bold text-accent bg-tint px-2 py-1 rounded-full">
          Open
        </span>
      )}
    </MotionLink>
  );
}
