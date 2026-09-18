"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Lock, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  MeetIllustration,
  SealIllustration,
  WriteIllustration,
} from "@/components/onboarding/Illustrations";
import BrandMark from "@/components/ui/BrandMark";
import Icon from "@/components/ui/Icon";

const SLIDES = [
  {
    title: "Write something today",
    body: "A message, a photo, a feeling. Capture how today feels before it slips away.",
    Art: WriteIllustration,
  },
  {
    title: "Seal it away",
    body: "Pick a date, a place, or both. Once it's sealed, there's no peeking.",
    Art: SealIllustration,
  },
  {
    title: "Meet it again later",
    body: "When the moment arrives, your capsule opens and your past self says hello.",
    Art: MeetIllustration,
  },
];

const LAST = SLIDES.length - 1;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

export default function OnboardingPage() {
  // direction: 1 = moving forward, -1 = back. Drives which way slides travel.
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  const reduceMotion = useReducedMotion();
  const dragX = useMotionValue(0);

  const next = useCallback(
    () => setPage(([i]) => (i < LAST ? [i + 1, 1] : [i, 0])),
    []
  );
  const prev = useCallback(
    () => setPage(([i]) => (i > 0 ? [i - 1, -1] : [i, 0])),
    []
  );
  const goTo = useCallback(
    (to: number) => setPage(([i]) => (to === i ? [i, 0] : [to, to > i ? 1 : -1])),
    []
  );

  // Keyboard: left/right arrows move between slides.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Swipe (touch or mouse drag): follow the finger a little, then decide.
  function onPan(_: PointerEvent, info: PanInfo) {
    if (!reduceMotion) dragX.set(info.offset.x * 0.35);
  }
  function onPanEnd(_: PointerEvent, info: PanInfo) {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) next();
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) prev();
    animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30 });
  }

  const slide = SLIDES[index];
  const Art = slide.Art;
  const isLast = index === LAST;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * 56 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * -56 }),
  };
  const transition = { duration: reduceMotion ? 0.01 : 0.28, ease: "easeOut" as const };

  return (
    <motion.main
      onPan={onPan}
      onPanEnd={onPanEnd}
      // pan-y: let the browser keep vertical scrolling, we take horizontal.
      style={{ touchAction: "pan-y" }}
      aria-roledescription="carousel"
      aria-label="Welcome to Dear Tomorrow"
      className="relative min-h-screen overflow-hidden select-none bg-gradient-to-b lg:bg-none from-hero-top to-hero-bottom text-white lg:text-ink"
    >
      {/* Desktop: static split background so only the content animates. */}
      <div aria-hidden className="hidden lg:block absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-hero-top to-hero-bottom overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute top-16 right-16 w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center rotate-6 text-white">
          <Icon as={Calendar} size="lg" />
        </div>
        <div className="absolute bottom-24 left-16 w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center -rotate-6 text-white">
          <Icon as={MapPin} size="lg" />
        </div>
        <div className="absolute bottom-16 right-24 w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center rotate-12 text-white">
          <Icon as={Lock} size="md" />
        </div>
      </div>
      <div aria-hidden className="hidden lg:block absolute inset-y-0 right-0 w-1/2 bg-surface" />

      <div className="relative z-10 min-h-screen flex flex-col lg:grid lg:grid-cols-2">
        {/* Illustration cell */}
        <div className="flex-1 flex flex-col items-center px-8 pt-6 lg:pt-8 lg:justify-center lg:text-white">
          <div className="self-start flex items-center gap-2 lg:absolute lg:top-8 lg:left-10">
            <BrandMark tone="light" />
            <span className="font-display text-lead text-white">Dear Tomorrow</span>
          </div>

          <div className="flex-1 flex items-center justify-center w-full pt-8 lg:pt-0">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="w-full max-w-[280px] lg:max-w-[400px]"
              >
                <motion.div style={{ x: dragX }}>
                  <Art className="w-full h-auto" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Text + controls cell */}
        <div className="flex flex-col items-center text-center px-8 pb-10 pt-4 lg:items-start lg:text-left lg:justify-center lg:px-20 lg:py-0">
          <div aria-live="polite" className="w-full min-h-[148px] lg:min-h-[196px]">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <motion.div style={{ x: dragX }}>
                  <p className="text-caption font-bold uppercase tracking-wide opacity-90 lg:opacity-100 lg:text-accent mb-2">
                    Step {index + 1} of {SLIDES.length}
                  </p>
                  <h1 className="font-display text-title lg:text-display mb-2 lg:mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lead opacity-90 lg:opacity-100 lg:text-ink-soft mx-auto lg:mx-0 max-w-[300px] lg:max-w-md">
                    {slide.body}
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* dots + arrows */}
          <div className="flex items-center gap-4 mt-4 lg:mt-8">
            <ArrowButton direction="prev" disabled={index === 0} onClick={prev} />
            <div role="group" aria-label="Choose a slide" className="flex items-center gap-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.title}`}
                  aria-current={i === index ? "step" : undefined}
                  className="p-2 -m-2 group"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-6 bg-white lg:bg-accent"
                        : "w-2 bg-white/50 lg:bg-line group-hover:bg-white/80 lg:group-hover:bg-accent/60"
                    }`}
                  />
                </button>
              ))}
            </div>
            <ArrowButton direction="next" disabled={isLast} onClick={next} />
          </div>

          {/* CTA slot: fixed height so nothing jumps when it swaps. */}
          <div className="w-full max-w-[240px] h-[76px] mt-6 lg:mt-8 flex items-start justify-center lg:justify-start">
            <AnimatePresence mode="wait" initial={false}>
              {isLast ? (
                <motion.div
                  key="cta"
                  className="w-full"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="lg:hidden">
                    <Button href="/sign-in" variant="white">
                      Get started
                    </Button>
                  </div>
                  <div className="hidden lg:block">
                    <Button href="/sign-in">Get started</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="skip"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/sign-in"
                    className="inline-block text-body font-bold underline underline-offset-4 opacity-90 lg:opacity-100 lg:text-ink-soft hover:opacity-100 py-3 px-2"
                  >
                    Skip
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Glyph = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 text-white hover:bg-white/30 lg:bg-tint lg:text-accent lg:hover:bg-line transition-colors disabled:opacity-30 disabled:pointer-events-none"
    >
      <Icon as={Glyph} size="md" />
    </button>
  );
}
