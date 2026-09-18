"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Sparkles, Video, Check, Lock } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import PhotoDrop from "@/components/ui/PhotoDrop";
import StepIndicator from "@/components/new-capsule/StepIndicator";
import MethodCard from "@/components/new-capsule/MethodCard";
import CapsuleCalendar from "@/components/new-capsule/CapsuleCalendar";
import LocationPicker from "@/components/new-capsule/LocationPicker";
import ReviewSummary from "@/components/new-capsule/ReviewSummary";
import { UnlockMethod } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const TOTAL_STEPS = 4;

export default function NewCapsulePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sealed, setSealed] = useState(false);

  // form state — all of this is what you'll POST to the backend once it exists
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [method, setMethod] = useState<UnlockMethod>("date");
  const [date, setDate] = useState<Date | null>(null);
  const [locationPicked, setLocationPicked] = useState(false);

  const unlockLabel =
    method === "place"
      ? locationPicked
        ? "Selected place"
        : "No place selected"
      : date
      ? formatDate(date.toISOString())
      : "No date selected";

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSeal() {
    // TODO: replace with a real POST /capsules call once the backend exists,
    // uploading `photo` to storage and saving message/method/date/location.
    setSealed(true);
  }

  if (sealed) {
    return (
      <div className="min-h-screen bg-gradient-to-b lg:bg-gradient-to-br from-sky to-sky-deep flex flex-col items-center justify-center text-white text-center px-8">
        <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-4">
          <Check size={34} />
        </div>
        <h2 className="font-display text-lg lg:text-2xl mb-1.5">Capsule sealed</h2>
        <p className="text-xs lg:text-sm opacity-90 leading-relaxed mb-5 max-w-[190px] lg:max-w-xs">
          We&apos;ll let you know the moment it&apos;s ready to open.
        </p>
        <div className="w-full max-w-[200px]">
          <Button variant="white" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex lg:items-center lg:justify-center lg:bg-cream lg:p-10">
      <div className="bg-white flex flex-col min-h-screen lg:min-h-0 lg:flex-row lg:max-w-4xl lg:w-full lg:rounded-3xl lg:overflow-hidden lg:shadow-2xl">
        <div className="flex-1 flex flex-col lg:max-w-md">
          <TopBar
            title={
              step === 1
                ? "New capsule"
                : step === 2
                ? "How should it unlock?"
                : step === 3
                ? method === "place"
                  ? "Pick a place"
                  : "Pick a date"
                : "Review & seal"
            }
            backHref={step === 1 ? "/dashboard" : undefined}
            variant="plain"
          />

          <div className="flex-1 p-4 lg:p-8">
            <StepIndicator step={step} total={TOTAL_STEPS} />

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
                  className="w-full bg-white border-2 border-dashed border-[#C9DFF7] rounded-2xl p-3 text-xs text-ink outline-none resize-none"
                />
                <label className="field-label">Photo</label>
                <PhotoDrop onChange={setPhoto} />
              </div>
            )}

            {step === 2 && (
              <div>
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
            {step === 3 && method === "place" && (
              <LocationPicker onChange={() => setLocationPicked(true)} />
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
          </div>

          <div className="p-4 lg:p-8 lg:pt-0">
            {step < TOTAL_STEPS ? (
              <Button onClick={next}>Next</Button>
            ) : (
              <Button onClick={handleSeal}>Seal it</Button>
            )}
            {step > 1 && (
              <button
                onClick={back}
                className="w-full text-center text-xs text-ink-soft font-bold mt-2 py-1"
              >
                Back
              </button>
            )}
          </div>
        </div>

        {/* Desktop-only: a live preview of the sealed capsule, so the form
            doesn't feel like it's floating alone in empty space. */}
        <div className="hidden lg:flex lg:w-80 bg-cream border-l border-line flex-col items-center justify-center p-8">
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-5">
            Live preview
          </p>
          <div className="w-56 rounded-[28px] bg-gradient-to-b from-sky to-sky-deep p-6 text-white text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center mx-auto mb-3">
              <Lock size={22} />
            </div>
            <p className="font-display text-sm mb-1">Sealed</p>
            <p className="text-[10px] opacity-90 leading-snug mb-3">
              Something from your past is waiting for you.
            </p>
            <div className="bg-white/18 px-3 py-1 rounded-full text-[9px] font-bold inline-block">
              {unlockLabel}
            </div>
          </div>
          {message && (
            <p className="text-[10.5px] text-ink-soft text-center mt-5 italic leading-relaxed max-w-[220px]">
              &ldquo;{message.slice(0, 90)}
              {message.length > 90 ? "..." : ""}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
