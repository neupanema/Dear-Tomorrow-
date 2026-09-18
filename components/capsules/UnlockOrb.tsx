"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LockOpen } from "lucide-react";
import Icon from "@/components/ui/Icon";

// Timeline for the opening moment (seconds).
const SHAKE = 0.45; // orb trembles, crack draws across it
const SPLIT_AT = 0.5; // halves fly apart, light + particles burst
const DONE = 1.35; // hand back to the page to show the message

// Deterministic (not random) so server and client render the same markup.
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const dist = 92 + (i % 4) * 22;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    r: 2.5 + (i % 3) * 1.5,
    color: ["fill-sun", "fill-coral", "fill-sky", "fill-white"][i % 4],
    delay: SPLIT_AT + (i % 5) * 0.03,
  };
});

// Jagged seam the orb splits along (top to bottom).
const SEAM = "M0 -58 L8 -34 L-7 -12 L7 10 L-6 32 L0 58";
const LEFT = `${SEAM} A58 58 0 0 1 0 -58 Z`;
const RIGHT = `${SEAM} A58 58 0 0 0 0 -58 Z`;
// Only the outer edge gets an outline, so the orb reads as whole until tapped.
const ARC_LEFT = "M0 58 A58 58 0 0 1 0 -58";
const ARC_RIGHT = "M0 -58 A58 58 0 0 1 0 58";

interface UnlockOrbProps {
  opening: boolean;
  onOpen: () => void;
  /** Fires once the burst has played and the message can be shown. */
  onOpened: () => void;
}

export default function UnlockOrb({ opening, onOpen, onOpened }: UnlockOrbProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!opening) return;
    const id = setTimeout(onOpened, (reduce ? 0.25 : DONE) * 1000);
    return () => clearTimeout(id);
  }, [opening, onOpened, reduce]);

  const half = (dir: 1 | -1) =>
    opening
      ? {
          x: dir * 52,
          rotate: dir * 20,
          opacity: 0,
          transition: { delay: SPLIT_AT, duration: 0.7, ease: "easeOut" as const },
        }
      : { x: 0, rotate: 0, opacity: 1 };

  return (
    <div className="relative w-36 h-36 lg:w-44 lg:h-44 flex items-center justify-center">
      {/* Soft light: breathes while waiting, then floods out on open. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,211,77,0.85) 0%, rgba(255,211,77,0) 65%)",
        }}
        animate={
          opening
            ? { scale: [0.5, 5], opacity: [0, 1, 0] }
            : { scale: [1, 1.18, 1], opacity: [0.35, 0.6, 0.35] }
        }
        transition={
          opening
            ? { delay: SPLIT_AT, duration: 1.1, ease: "easeOut", times: [0, 0.25, 1] }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.button
        type="button"
        onClick={onOpen}
        disabled={opening}
        aria-label="Open your capsule"
        whileHover={opening ? undefined : { scale: 1.06 }}
        whileTap={opening ? undefined : { scale: 0.94 }}
        animate={opening ? { rotate: [0, -7, 7, -5, 5, 0] } : { rotate: 0 }}
        transition={
          opening
            ? { duration: SHAKE, ease: "easeInOut" }
            : { type: "spring", stiffness: 400, damping: 20 }
        }
        className="relative w-full h-full rounded-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-deep"
      >
        <svg
          viewBox="-70 -70 140 140"
          overflow="visible"
          className="w-full h-full drop-shadow-[0_10px_16px_rgba(255,211,77,0.55)]"
          fill="none"
          aria-hidden
          focusable="false"
        >
          {([
            { fill: LEFT, arc: ARC_LEFT, dir: -1 },
            { fill: RIGHT, arc: ARC_RIGHT, dir: 1 },
          ] as const).map(({ fill, arc, dir }) => (
            <motion.g
              key={dir}
              animate={half(dir)}
              style={{ transformOrigin: "center", transformBox: "fill-box" }}
            >
              <path d={fill} className="fill-white" />
              <path d={arc} className="stroke-sun" strokeWidth="4" strokeLinecap="round" />
            </motion.g>
          ))}

          {/* the crack lights up along the seam right before the split */}
          <motion.path
            d={SEAM}
            className="stroke-coral"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={opening ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
          />

          {PARTICLES.map((p, i) => (
            <motion.circle
              key={i}
              r={p.r}
              className={p.color}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={
                opening
                  ? { x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0.5, 1.2, 0.4] }
                  : { x: 0, y: 0, opacity: 0 }
              }
              transition={{ delay: p.delay, duration: 0.8, ease: "easeOut" }}
            />
          ))}
        </svg>

        {/* the open-lock icon, sucked away as the crack appears */}
        <motion.span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center text-sky-deep pointer-events-none"
          animate={opening ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Icon as={LockOpen} size="xl" className="lg:w-10 lg:h-10" />
        </motion.span>
      </motion.button>
    </div>
  );
}
