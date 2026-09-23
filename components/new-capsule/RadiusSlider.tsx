"use client";

import { formatDistance } from "@/lib/utils";

interface RadiusSliderProps {
  value: number;
  onChange: (meters: number) => void;
}

const MIN_METERS = 50;
const MAX_METERS = 2000;
const STEP_METERS = 50;

/** How close you'll need to be to the pin for this capsule to unlock (unlock_radius_meters). */
export default function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor="unlock-radius" className="field-label mt-0">
          Unlock radius
        </label>
        <span className="text-caption font-bold text-accent">{formatDistance(value / 1000)}</span>
      </div>
      <input
        id="unlock-radius"
        type="range"
        min={MIN_METERS}
        max={MAX_METERS}
        step={STEP_METERS}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
      <p className="text-caption text-ink-soft mt-1">
        How close you need to be to this spot for the capsule to unlock.
      </p>
    </div>
  );
}
