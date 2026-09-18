import { Bell, Lock, MapPin, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile: full-bleed gradient screen. Desktop: this becomes the left
          half of a split screen, with room to breathe and a few floating
          bits of the product to hint at what's inside. */}
      <div className="min-h-screen lg:min-h-0 lg:w-1/2 bg-gradient-to-b lg:bg-gradient-to-br from-sky to-sky-deep flex flex-col items-center justify-center text-white text-center px-8 relative overflow-hidden">
        <div className="hidden lg:block absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="hidden lg:block absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white/10" />
        <div className="hidden lg:flex absolute top-16 right-16 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center rotate-6">
          <Calendar size={22} />
        </div>
        <div className="hidden lg:flex absolute bottom-24 left-16 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center -rotate-6">
          <MapPin size={22} />
        </div>
        <div className="hidden lg:flex absolute bottom-16 right-24 w-12 h-12 rounded-2xl bg-white/15 items-center justify-center rotate-12">
          <Lock size={18} />
        </div>

        <div className="w-[74px] h-[74px] rounded-[22px] bg-white flex items-center justify-center mb-5">
          <Bell size={32} className="text-sky-deep" />
        </div>
        <h1 className="font-display text-2xl lg:text-4xl mb-2">Dear Tomorrow</h1>
        <p className="text-sm lg:text-base opacity-90 leading-relaxed mb-6 max-w-[220px] lg:max-w-[320px]">
          Leave something for the person you&apos;ll become.
        </p>
        <div className="w-full max-w-[220px] lg:hidden">
          <Button href="/sign-in" variant="white">
            Get started
          </Button>
        </div>
      </div>

      {/* Desktop-only right half: a quick, calm explanation of the idea,
          plus the real call to action so it doesn't feel duplicated. */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-20 bg-white">
        <p className="text-xs font-bold text-sky-deep uppercase tracking-wide mb-3">
          A letter to your future self
        </p>
        <h2 className="font-display text-3xl text-ink mb-4 leading-snug">
          Write it today.
          <br />
          Meet it again later.
        </h2>
        <p className="text-sm text-ink-soft leading-relaxed mb-8 max-w-md">
          Seal a message and a photo, then choose what unlocks it — a future
          date, a place you&apos;ll return to, or both. Dear Tomorrow holds
          onto it until that moment actually arrives.
        </p>
        <div className="max-w-[240px]">
          <Button href="/sign-in">Get started</Button>
        </div>
      </div>
    </div>
  );
}
