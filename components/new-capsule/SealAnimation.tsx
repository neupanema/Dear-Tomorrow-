"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Timeline (seconds). Everything is expressed as delays so the whole thing
// reads top-to-bottom: halves close -> squeeze -> lock drops -> shackle
// clicks -> burst.
const T = {
  close: 0.15,
  squeeze: 0.7,
  lock: 0.85,
  shackle: 1.15,
  burst: 1.25,
  done: 1.9,
};

const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + 0.3;
  const dist = 62 + (i % 3) * 16;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    size: 3 + (i % 3),
    color: i % 3 === 0 ? "fill-sun" : i % 3 === 1 ? "fill-white" : "fill-coral",
  };
});

interface SealAnimationProps {
  /** Called once the lock has clicked and the burst has played. */
  onComplete?: () => void;
  className?: string;
}

/**
 * A capsule whose two halves slide together and lock. Purely visual — the
 * parent decides what to show once `onComplete` fires.
 */
export default function SealAnimation({ onComplete, className }: SealAnimationProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = setTimeout(() => onComplete?.(), (reduce ? 0.5 : T.done) * 1000);
    return () => clearTimeout(id);
  }, [onComplete, reduce]);

  const spring = { type: "spring" as const, stiffness: 260, damping: 18 };

  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      fill="none"
      role="presentation"
      aria-hidden
      focusable="false"
      overflow="visible"
    >
      {/* soft halo */}
      <circle cx="100" cy="110" r="88" className="fill-white" opacity="0.14" />

      {/* whole capsule squeezes a touch once the halves meet */}
      <motion.g
        style={{ transformOrigin: "100px 110px", transformBox: "view-box" }}
        animate={{ scale: [1, 1.07, 0.98, 1] }}
        transition={{ delay: T.squeeze, duration: 0.45, ease: "easeOut" }}
      >
        {/* top half, slides down into place */}
        <motion.g
          initial={{ y: -44, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: T.close }}
        >
          <g transform="translate(62 30)" strokeLinejoin="round">
            <path d="M0 80 V38 a38 38 0 0 1 76 0 V80 Z" className="fill-coral stroke-night" strokeWidth="3.5" />
            <path d="M14 36 V56" className="stroke-white" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
            <rect x="0" y="66" width="76" height="14" className="fill-sun stroke-night" strokeWidth="3.5" />
          </g>
        </motion.g>

        {/* bottom half, slides up into place */}
        <motion.g
          initial={{ y: 44, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: T.close }}
        >
          <g transform="translate(62 110)" strokeLinejoin="round">
            <path d="M0 0 V42 a38 38 0 0 0 76 0 V0 Z" className="fill-white stroke-night" strokeWidth="3.5" />
            <path d="M14 70 V88" className="stroke-sky" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          </g>
        </motion.g>
      </motion.g>

      {/* shockwave ring */}
      <motion.circle
        cx="100"
        cy="110"
        r="40"
        className="stroke-white"
        strokeWidth="3"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 2.1], opacity: [0.9, 0] }}
        transition={{ delay: T.burst, duration: 0.6, ease: "easeOut" }}
        style={{ transformOrigin: "100px 110px", transformBox: "view-box" }}
      />

      {/* padlock: body pops in, then the shackle drops and clicks shut */}
      {/* position and animation live on separate groups: framer writes a CSS
          transform that would otherwise override the translate() attribute */}
      <g transform="translate(100 108)">
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring, stiffness: 320, damping: 14, delay: T.lock }}
        >
          <motion.path
            d="M-11 -6 V-16 a11 11 0 0 1 22 0 V-6"
            className="stroke-night"
            strokeWidth="4.5"
            strokeLinecap="round"
            initial={{ y: -9 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22, delay: T.shackle }}
          />
          <rect x="-19" y="-8" width="38" height="32" rx="9" className="fill-sun stroke-night" strokeWidth="3.5" />
          <circle cx="0" cy="8" r="4.5" className="fill-night" />
          <path d="M0 10 V16" className="stroke-night" strokeWidth="3.5" strokeLinecap="round" />
        </motion.g>
      </g>

      {/* particles */}
      {PARTICLES.map((p, i) => (
        <motion.circle
          key={i}
          cx="100"
          cy="110"
          r={p.size}
          className={p.color}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
          transition={{ delay: T.burst, duration: 0.75, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
