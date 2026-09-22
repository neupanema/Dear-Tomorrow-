"use client";

import { motion, useReducedMotion } from "framer-motion";
import { daysUntil } from "@/lib/utils";

interface CountdownRingProps {
  createdAt: string;
  unlockDate: string;
  /** "onSky" = white ring for the blue sealed screen (the only place this is used today). */
  tone?: "onSky";
}

const SIZE = 168;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A ring that fills in as a sealed date capsule gets closer to opening. */
export default function CountdownRing({ createdAt, unlockDate }: CountdownRingProps) {
  const reduce = useReducedMotion();
  const daysLeft = Math.max(0, daysUntil(unlockDate));

  const created = new Date(createdAt).getTime();
  const target = new Date(unlockDate).getTime();
  const span = target - created;
  const progress = span > 0 ? Math.min(1, Math.max(0, (Date.now() - created) / span)) : 1;

  const today = daysLeft === 0;

  return (
    <div className="relative w-[136px] h-[136px] lg:w-[168px] lg:h-[168px]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#FFD34D"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
          transition={reduce ? { duration: 0 } : { duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        {today ? (
          <span className="font-display text-heading">Today</span>
        ) : (
          <>
            <span className="font-display text-display leading-none">{daysLeft}</span>
            <span className="text-caption font-bold uppercase tracking-wide mt-1">
              {daysLeft === 1 ? "day left" : "days left"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
