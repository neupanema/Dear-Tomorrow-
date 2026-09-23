"use client";

import dynamic from "next/dynamic";
import { Calendar, MapPin, Sparkles, Video } from "lucide-react";
import PhotoDrop from "@/components/ui/PhotoDrop";
import TagInput from "@/components/ui/TagInput";
import MethodCard from "@/components/new-capsule/MethodCard";
import CapsuleCalendar from "@/components/new-capsule/CapsuleCalendar";
import RadiusSlider from "@/components/new-capsule/RadiusSlider";
import { LocationPoint, UnlockMethod } from "@/lib/types";

// Leaflet touches `window` on import, so the picker can only load in the browser.
const LocationPicker = dynamic(() => import("@/components/new-capsule/LocationPicker"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-64 lg:h-80 rounded-2xl bg-map-land animate-pulse" />,
});

interface ExistingPhoto {
  path: string;
  url: string;
}

interface CapsuleFormFieldsProps {
  step: number;
  message: string;
  onMessageChange: (value: string) => void;
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  existingPhotos?: ExistingPhoto[];
  onRemoveExistingPhoto?: (path: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  tagSuggestions?: string[];
  method: UnlockMethod;
  onMethodChange: (method: UnlockMethod) => void;
  date: Date | null;
  onDateChange: (date: Date) => void;
  locationPoint: LocationPoint | null;
  onLocationChange: (point: LocationPoint) => void;
  radiusMeters: number;
  onRadiusChange: (meters: number) => void;
}

/**
 * Steps 1–3 of the capsule wizard (message+photos+tags, unlock method,
 * date/place), shared between creating a new capsule (app/new-capsule) and
 * editing a still-sealed one (app/capsule/[id]/edit). Step 4 (review + seal)
 * isn't here — create and edit have very different completion flows.
 */
export default function CapsuleFormFields({
  step,
  message,
  onMessageChange,
  photos,
  onPhotosChange,
  existingPhotos = [],
  onRemoveExistingPhoto,
  tags,
  onTagsChange,
  tagSuggestions,
  method,
  onMethodChange,
  date,
  onDateChange,
  locationPoint,
  onLocationChange,
  radiusMeters,
  onRadiusChange,
}: CapsuleFormFieldsProps) {
  return (
    <>
      {step === 1 && (
        <div>
          <label className="field-label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Dear future me, I hope you didn't give up on..."
            rows={4}
            className="w-full bg-surface border-2 border-dashed border-line-strong rounded-2xl p-3 text-lead text-ink resize-none focus:border-accent"
          />
          <p className="field-label">Photos</p>
          <PhotoDrop
            value={photos}
            onChange={onPhotosChange}
            existing={existingPhotos}
            onRemoveExisting={onRemoveExistingPhoto}
          />
          <p className="field-label">Tags</p>
          <TagInput value={tags} onChange={onTagsChange} suggestions={tagSuggestions} />
        </div>
      )}

      {step === 2 && (
        <div role="group" aria-label="How should it unlock?">
          <MethodCard
            icon={Calendar}
            title="On a date"
            subtitle="Choose a day in the future to open it"
            active={method === "date"}
            onClick={() => onMethodChange("date")}
          />
          <MethodCard
            icon={MapPin}
            title="At a place"
            subtitle="Unlocks when you return somewhere"
            active={method === "place"}
            onClick={() => onMethodChange("place")}
          />
          <MethodCard
            icon={Sparkles}
            title="Date + place"
            subtitle="Needs both to open, for a bigger moment"
            active={method === "date-and-place"}
            onClick={() => onMethodChange("date-and-place")}
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

      {step === 3 && method !== "place" && <CapsuleCalendar value={date} onChange={onDateChange} />}
      {step === 3 && method !== "date" && (
        <div className={method === "date-and-place" ? "mt-6" : undefined}>
          <LocationPicker value={locationPoint} onChange={onLocationChange} />
          <RadiusSlider value={radiusMeters} onChange={onRadiusChange} />
        </div>
      )}
    </>
  );
}
