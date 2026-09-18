"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, LockOpen, ChevronLeft } from "lucide-react";
import { getCapsuleById } from "@/lib/mock-data";
import { formatDate, daysAgo } from "@/lib/utils";

export default function CapsuleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const capsule = getCapsuleById(params.id);
  const [revealed, setRevealed] = useState(false);

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
          <ChevronLeft size={20} />
        </Link>
        <div className="w-[92px] h-[92px] lg:w-32 lg:h-32 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center mb-4 lg:mb-6">
          <Lock size={32} className="lg:w-11 lg:h-11" />
        </div>
        <h2 className="font-display text-base lg:text-2xl mb-1.5">Sealed</h2>
        <p className="text-xs lg:text-sm opacity-90 leading-relaxed mb-4">
          Something from your past
          <br />
          is waiting for you.
        </p>
        <div className="bg-white/18 px-3.5 py-1.5 rounded-full text-[10.5px] lg:text-xs font-bold">
          {capsule.unlockMethod === "place"
            ? `Opens when I return to ${capsule.unlockLocation?.label}`
            : `Opens ${capsule.unlockDate ? formatDate(capsule.unlockDate) : ""}`}
        </div>
      </div>
    );
  }

  // --- unlocked, not yet revealed: the "tap to open" moment ---
  if (!revealed) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-8 relative">
        <Link
          href="/dashboard"
          className="absolute left-4 top-4 lg:left-8 lg:top-8 text-ink"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={20} />
        </Link>
        <button
          onClick={() => setRevealed(true)}
          className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-white border-[3px] border-sun flex items-center justify-center mb-4 lg:mb-6 shadow-[0_10px_24px_-10px_rgba(255,211,77,0.6)]"
        >
          <LockOpen size={36} className="text-sky-deep lg:w-11 lg:h-11" />
        </button>
        <h2 className="font-display text-base lg:text-2xl text-ink mb-1.5">
          Ready to open
        </h2>
        <p className="text-xs lg:text-sm text-ink-soft leading-relaxed mb-4">
          Take a breath. This is you, {daysAgo(capsule.createdAt)} days ago.
        </p>
        <p className="text-[10.5px] lg:text-xs font-bold text-sky-deep">
          Tap to open →
        </p>
      </div>
    );
  }

  // --- unlocked and revealed: the actual message ---
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center lg:justify-center">
      <div className="w-full lg:max-w-lg lg:rounded-3xl lg:overflow-hidden lg:shadow-xl">
        <div className="bg-sky px-4 pt-4 pb-4 lg:px-8 lg:pt-8 lg:pb-6 relative">
          <Link
            href="/dashboard"
            className="absolute left-4 top-4 lg:left-8 lg:top-8 text-white"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-display text-white text-lg lg:text-2xl text-center leading-snug">
            Your past has
            <br />
            something to tell you
          </h1>
        </div>
        <div className="flex-1 p-4 lg:p-8 bg-white">
          <div
            className={`h-32 lg:h-56 rounded-2xl mb-3 bg-gradient-to-br ${capsule.photoGradient} flex items-center justify-center text-white text-xs lg:text-sm font-bold`}
          >
            Your photo from that day
          </div>
          <div className="bg-cream rounded-2xl p-3 lg:p-5 border-l-4 border-sun text-xs lg:text-sm text-ink leading-relaxed">
            &ldquo;{capsule.message}&rdquo;
          </div>
          <p className="text-[10px] lg:text-xs text-ink-soft text-center mt-2 lg:mt-3">
            Written {daysAgo(capsule.createdAt)} days ago
          </p>
        </div>
      </div>
    </div>
  );
}
