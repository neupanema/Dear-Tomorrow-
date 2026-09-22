"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, Sparkles, Video, Check, Lock } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import PhotoDrop from "@/components/ui/PhotoDrop";
import StepIndicator from "@/components/new-capsule/StepIndicator";
import MethodCard from "@/components/new-capsule/MethodCard";
import CapsuleCalendar from "@/components/new-capsule/CapsuleCalendar";
import ReviewSummary from "@/components/new-capsule/ReviewSummary";
import SealAnimation from "@/components/new-capsule/SealAnimation";
import { LocationPoint, UnlockMethod } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { removeCapsulePhoto, uploadCapsulePhoto } from "@/lib/photos";
import Icon from "@/components/ui/Icon";

const TOTAL_STEPS = 4;

// Leaflet touches `window` on import, so the picker can only load in the browser.
const LocationPicker = dynamic(() => import("@/components/new-capsule/LocationPicker"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-64 lg:h-80 rounded-2xl bg-map-land animate-pulse" />,
});

export default function NewCapsulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false); // request in flight, before the animation
  const [step, setStep] = useState(1);
  const [stepDir, setStepDir] = useState(1); // which way the step content slides in
  // editing -> sealing (capsule closing animation) -> sealed (confirmation)
  const [phase, setPhase] = useState<"editing" | "sealing" | "sealed">("editing");

  // form state — all of this is what you'll POST to the backend once it exists
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [method, setMethod] = useState<UnlockMethod>("date");
  const [date, setDate] = useState<Date | null>(null);
  const [locationPoint, setLocationPoint] = useState<LocationPoint | null>(null);

  const dateLabel = date ? formatDate(date.toISOString()) : "No date selected";
  const placeLabel = locationPoint
    ? locationPoint.label ?? "Selected place"
    : "No place selected";
  const unlockLabel =
    method === "place"
      ? placeLabel
      : method === "date-and-place"
      ? `${dateLabel} · ${placeLabel}`
      : dateLabel;

  function next() {
    setStepDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStepDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSeal() {
    if (saving) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast("Please sign in again", { variant: "error" });
      setSaving(false);
      router.push("/sign-in");
      return;
    }

    const needsPlace = method === "place" || method === "date-and-place";
    if (needsPlace && !locationPoint) {
      // Without coordinates the capsule could never unlock.
      toast("Pick a place on the map first", { variant: "error" });
      setSaving(false);
      setStepDir(-1);
      setStep(3);
      return;
    }

    // No title field in this flow — derive a short one from the message.
    const title = message.trim().slice(0, 60) || "A letter to future me";
    const usesDate = method === "date" || method === "date-and-place";
    const usesPlace = method === "place" || method === "date-and-place";

    // The photo is stored under the capsule's id, so pick the id up front and
    // upload before the row exists. A failed upload stops the seal (rather
    // than silently saving the capsule without its photo).
    const capsuleId = crypto.randomUUID();
    let photoPath: string | null = null;
    if (photo) {
      try {
        photoPath = await uploadCapsulePhoto(supabase, user.id, capsuleId, photo);
      } catch (err) {
        toast(`Couldn't upload your photo: ${(err as Error).message}`, { variant: "error" });
        setSaving(false);
        return;
      }
    }

    // Only send the columns this unlock method actually uses. A date-only
    // capsule shouldn't touch the location columns at all.
    const { error } = await supabase.from("capsules").insert({
      id: capsuleId,
      user_id: user.id,
      title,
      photo_path: photoPath,
      message,
      unlock_method: method,
      status: "sealed",
      ...(usesDate && date ? { unlock_date: date.toISOString() } : {}),
      ...(usesPlace && locationPoint
        ? {
            unlock_lat: locationPoint.lat,
            unlock_lng: locationPoint.lng,
            unlock_location_label: locationPoint.label ?? null,
          }
        : {}),
    });

    setSaving(false);

    if (error) {
      // Don't leave an orphaned upload behind for a capsule that doesn't exist.
      if (photoPath) void removeCapsulePhoto(supabase, photoPath);
      toast(error.message, { variant: "error" });
      return;
    }

    setPhase("sealing");
  }

  function backToDashboard() {
    // Fired here (not on the confirmation screen) so the toast is what you
    // see when you land back on the dashboard.
    toast("Capsule sealed");
    router.push("/dashboard");
  }

  const handleSealed = useCallback(() => setPhase("sealed"), []);

  // The sealing animation and the confirmation share one screen, so the
  // capsule stays put while the text underneath swaps.
  if (phase !== "editing") {
    const done = phase === "sealed";
    return (
      <main data-on-sky="" className="min-h-screen bg-hero flex flex-col items-center justify-center text-white text-center px-8">
        <div className="relative mb-2">
          <SealAnimation onComplete={handleSealed} className="w-48 h-52 lg:w-56 lg:h-60" />
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 14 }}
                className="absolute bottom-6 right-2 w-11 h-11 rounded-full bg-white text-sky-deep flex items-center justify-center shadow-lg"
              >
                <Icon as={Check} size="lg" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div role="status" aria-live="polite" className="min-h-[140px] flex flex-col items-center">
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <h1 className="font-display text-heading lg:text-title mb-2">Capsule sealed</h1>
                <p className="text-body lg:text-lead mb-5 max-w-[190px] lg:max-w-xs">
                  We&apos;ll let you know the moment it&apos;s ready to open.
                </p>
                <div className="w-full min-w-[200px]">
                  <Button variant="white" onClick={backToDashboard}>
                    Back to dashboard
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.h1
                key="sealing"
                exit={{ opacity: 0 }}
                className="font-display text-heading lg:text-title"
              >
                Sealing your capsule...
              </motion.h1>
            )}
          </AnimatePresence>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen lg:flex lg:items-center lg:justify-center lg:bg-cream lg:p-10">
      <div className="bg-surface flex flex-col min-h-screen lg:min-h-0 lg:flex-row lg:max-w-4xl lg:w-full lg:rounded-3xl lg:overflow-hidden lg:shadow-2xl">
        <div className="flex-1 flex flex-col">
          <TopBar
            title={
              step === 1
                ? "New capsule"
                : step === 2
                ? "How should it unlock?"
                : step === 3
                ? method === "place"
                  ? "Pick a place"
                  : method === "date-and-place"
                  ? "Pick a date and place"
                  : "Pick a date"
                : "Review & seal"
            }
            backHref={step === 1 ? "/dashboard" : undefined}
            variant="plain"
          />

          <div className="flex-1 p-4 lg:p-8">
            <StepIndicator step={step} total={TOTAL_STEPS} />
            {/* Announces the step to screen readers when Next/Back is pressed. */}
            <p className="sr-only" aria-live="polite">
              Step {step} of {TOTAL_STEPS}
            </p>

            <motion.div
              key={step}
              initial={{ opacity: 0, x: stepDir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {step === 1 && (
                <div>
                  <label className="field-label" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dear future me, I hope you didn't give up on..."
                    rows={4}
                    className="w-full bg-surface border-2 border-dashed border-line-strong rounded-2xl p-3 text-lead text-ink resize-none focus:border-accent"
                  />
                  <p className="field-label">Photo</p>
                  <PhotoDrop onChange={setPhoto} />
                </div>
              )}

              {step === 2 && (
                <div role="group" aria-label="How should it unlock?">
                  <MethodCard
                    icon={Calendar}
                    title="On a date"
                    subtitle="Choose a day in the future to open it"
                    active={method === "date"}
                    onClick={() => setMethod("date")}
                  />
                  <MethodCard
                    icon={MapPin}
                    title="At a place"
                    subtitle="Unlocks when you return somewhere"
                    active={method === "place"}
                    onClick={() => setMethod("place")}
                  />
                  <MethodCard
                    icon={Sparkles}
                    title="Date + place"
                    subtitle="Needs both to open, for a bigger moment"
                    active={method === "date-and-place"}
                    onClick={() => setMethod("date-and-place")}
                  />
                  <MethodCard
                    icon={Video}
                    title="Video message"
                    subtitle="Coming soon"
                    badge="Soon"
                    disabled
                  />
                </div>
              )}

              {step === 3 && method !== "place" && (
                <CapsuleCalendar value={date} onChange={setDate} />
              )}
              {step === 3 && method !== "date" && (
                <div className={method === "date-and-place" ? "mt-6" : undefined}>
                  <LocationPicker value={locationPoint} onChange={setLocationPoint} />
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="h-16 rounded-2xl mb-3 bg-gradient-to-br from-sun via-coral to-sky" />
                  <ReviewSummary
                    message={message}
                    hasPhoto={!!photo}
                    unlockLabel={unlockLabel}
                  />
                </div>
              )}
            </motion.div>
          </div>

          <div className="p-4 lg:p-8 lg:pt-0">
            {step < TOTAL_STEPS ? (
              <Button onClick={next}>Next</Button>
            ) : (
              <Button onClick={handleSeal} loading={saving}>
                {saving ? "Sealing..." : "Seal it"}
              </Button>
            )}
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                disabled={saving}
                className="w-full text-center text-body text-ink-soft font-bold mt-2 py-1 disabled:opacity-40"
              >
                Back
              </button>
            )}
          </div>
        </div>

        {/* Desktop-only: a live preview of the sealed capsule, so the form
            doesn't feel like it's floating alone in empty space. */}
        <div className="hidden lg:flex lg:w-80 bg-cream border-l border-line flex-col items-center justify-center p-8">
          <p className="text-caption font-bold text-ink-soft uppercase tracking-wide mb-5">
            Live preview
          </p>
          <div className="w-56 rounded-[28px] bg-gradient-to-b from-hero-top via-hero-bottom via-25% to-hero-bottom p-6 text-white text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center mx-auto mb-3">
              <Icon as={Lock} size="lg" />
            </div>
            <p className="font-display text-lead mb-1">Sealed</p>
            <p className="text-caption mb-3">
              Something from your past is waiting for you.
            </p>
            <div className="bg-black/20 px-3 py-1 rounded-full text-caption font-bold inline-block">
              {unlockLabel}
            </div>
          </div>
          {message && (
            <p className="text-caption text-ink-soft text-center mt-5 italic max-w-[220px]">
              &ldquo;{message.slice(0, 90)}
              {message.length > 90 ? "..." : ""}&rdquo;
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
