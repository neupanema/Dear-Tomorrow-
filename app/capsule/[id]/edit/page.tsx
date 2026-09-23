"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/new-capsule/StepIndicator";
import CapsuleFormFields from "@/components/new-capsule/CapsuleFormFields";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { listAllTags, toCapsule, updateCapsule, type CapsuleRow } from "@/lib/supabase/capsules";
import { getCapsulePhotoUrls, removeCapsulePhotos, uploadCapsulePhoto } from "@/lib/photos";
import { UNLOCK_RADIUS_METERS } from "@/lib/checkLocationCapsules";
import { Capsule, LocationPoint, UnlockMethod } from "@/lib/types";

const TOTAL_STEPS = 3;

/** Edits a still-sealed capsule. Redirects away if it's not yours or already unlocked. */
export default function EditCapsulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  // undefined = still loading; null = redirected away (not owner / not sealed / not found).
  const [capsule, setCapsule] = useState<Capsule | null | undefined>(undefined);
  const [step, setStep] = useState(1);
  const [stepDir, setStepDir] = useState(1);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [existingPhotos, setExistingPhotos] = useState<{ path: string; url: string }[]>([]);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [method, setMethod] = useState<UnlockMethod>("date");
  const [date, setDate] = useState<Date | null>(null);
  const [locationPoint, setLocationPoint] = useState<LocationPoint | null>(null);
  const [radiusMeters, setRadiusMeters] = useState(UNLOCK_RADIUS_METERS);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    Promise.all([
      supabase.auth.getUser(),
      supabase.from("capsules").select("*").eq("id", id).maybeSingle(),
    ]).then(async ([{ data: userData }, { data, error }]) => {
      if (!active) return;
      const loaded = error || !data ? null : toCapsule(data as CapsuleRow);

      if (!loaded || loaded.userId !== userData.user?.id || loaded.status !== "sealed") {
        toast(
          loaded ? "This capsule already unlocked — it can no longer be edited." : "Capsule not found",
          { variant: "error" }
        );
        router.replace(loaded ? `/capsule/${id}` : "/dashboard");
        return;
      }

      setCapsule(loaded);
      setMessage(loaded.message);
      setTags(loaded.tags);
      setMethod(loaded.unlockMethod);
      setDate(loaded.unlockDate ? new Date(loaded.unlockDate) : null);
      setLocationPoint(
        loaded.unlockLocation?.lat !== undefined && loaded.unlockLocation?.lng !== undefined
          ? { lat: loaded.unlockLocation.lat, lng: loaded.unlockLocation.lng, label: loaded.unlockLocation.label }
          : null
      );
      setRadiusMeters(loaded.unlockRadiusMeters ?? UNLOCK_RADIUS_METERS);

      if (loaded.photoPaths.length > 0) {
        const urls = await getCapsulePhotoUrls(supabase, loaded.photoPaths);
        if (active) {
          setExistingPhotos(
            loaded.photoPaths.map((path, i) => ({ path, url: urls[i] })).filter((p) => p.url)
          );
        }
      }
    });

    return () => {
      active = false;
    };
  }, [id, router, toast]);

  useEffect(() => {
    // Best effort — an empty suggestion list just means nothing to suggest yet.
    listAllTags(createClient())
      .then(setTagSuggestions)
      .catch(() => {});
  }, []);

  function next() {
    setStepDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStepDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function removeExistingPhoto(path: string) {
    setExistingPhotos((prev) => prev.filter((p) => p.path !== path));
    setRemovedPaths((prev) => [...prev, path]);
  }

  async function handleSave() {
    if (!capsule || saving) return;

    const needsPlace = method === "place" || method === "date-and-place";
    if (needsPlace && !locationPoint) {
      toast("Pick a place on the map first", { variant: "error" });
      setStepDir(-1);
      setStep(3);
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const uploadedPaths: string[] = [];
    if (newPhotos.length > 0) {
      try {
        for (const file of newPhotos) {
          uploadedPaths.push(await uploadCapsulePhoto(supabase, capsule.userId, capsule.id, file));
        }
      } catch (err) {
        if (uploadedPaths.length > 0) void removeCapsulePhotos(supabase, uploadedPaths);
        toast(`Couldn't upload your photos: ${(err as Error).message}`, { variant: "error" });
        setSaving(false);
        return;
      }
    }

    const usesDate = method === "date" || method === "date-and-place";
    const usesPlace = method === "place" || method === "date-and-place";

    let updated;
    try {
      updated = await updateCapsule(supabase, capsule.id, {
        title: message.trim().slice(0, 60) || "A letter to future me",
        message,
        tags,
        photo_paths: [...existingPhotos.map((p) => p.path), ...uploadedPaths],
        unlock_method: method,
        unlock_date: usesDate && date ? date.toISOString() : null,
        unlock_lat: usesPlace && locationPoint ? locationPoint.lat : null,
        unlock_lng: usesPlace && locationPoint ? locationPoint.lng : null,
        unlock_location_label: usesPlace && locationPoint ? locationPoint.label ?? null : null,
        ...(usesPlace ? { unlock_radius_meters: radiusMeters } : {}),
      });
    } catch (err) {
      if (uploadedPaths.length > 0) void removeCapsulePhotos(supabase, uploadedPaths);
      toast((err as Error).message, { variant: "error" });
      setSaving(false);
      return;
    }

    setSaving(false);

    if (!updated) {
      toast("This capsule already unlocked — it can no longer be edited.", { variant: "error" });
      router.replace(`/capsule/${capsule.id}`);
      return;
    }

    // Only drop the removed photos from storage once the row itself saved.
    if (removedPaths.length > 0) void removeCapsulePhotos(supabase, removedPaths);

    toast("Capsule updated");
    router.push(`/capsule/${capsule.id}`);
  }

  if (!capsule) return null;

  return (
    <main className="min-h-screen lg:flex lg:items-center lg:justify-center lg:bg-cream lg:p-10">
      <div className="bg-surface flex flex-col min-h-screen lg:min-h-0 lg:max-w-2xl lg:w-full lg:rounded-3xl lg:overflow-hidden lg:shadow-2xl">
        <TopBar
          title={
            step === 1
              ? "Edit capsule"
              : step === 2
              ? "How should it unlock?"
              : method === "place"
              ? "Pick a place"
              : method === "date-and-place"
              ? "Pick a date and place"
              : "Pick a date"
          }
          backHref={step === 1 ? `/capsule/${capsule.id}` : undefined}
          variant="plain"
        />

        <div className="flex-1 p-4 lg:p-8">
          <StepIndicator step={step} total={TOTAL_STEPS} />
          <p className="sr-only" aria-live="polite">
            Step {step} of {TOTAL_STEPS}
          </p>

          <CapsuleFormFields
            step={step}
            message={message}
            onMessageChange={setMessage}
            photos={newPhotos}
            onPhotosChange={setNewPhotos}
            existingPhotos={existingPhotos}
            onRemoveExistingPhoto={removeExistingPhoto}
            tags={tags}
            onTagsChange={setTags}
            tagSuggestions={tagSuggestions}
            method={method}
            onMethodChange={setMethod}
            date={date}
            onDateChange={setDate}
            locationPoint={locationPoint}
            onLocationChange={setLocationPoint}
            radiusMeters={radiusMeters}
            onRadiusChange={setRadiusMeters}
          />
        </div>

        <div className="p-4 lg:p-8 lg:pt-0">
          {step < TOTAL_STEPS ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button onClick={handleSave} loading={saving}>
              {saving ? "Saving..." : "Save changes"}
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
    </main>
  );
}
