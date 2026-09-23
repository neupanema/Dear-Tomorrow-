import type { SupabaseClient } from "@supabase/supabase-js";
import { Capsule, CapsuleStatus, UnlockMethod } from "@/lib/types";
import { removeCapsulePhotos } from "@/lib/photos";

// Shape of a row from the `capsules` table (see supabase/schema.sql).
export interface CapsuleRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  unlock_method: UnlockMethod;
  unlock_date: string | null;
  unlock_lat: number | null;
  unlock_lng: number | null;
  unlock_location_label: string | null;
  unlock_radius_meters: number;
  status: CapsuleStatus;
  unlocked_at: string | null;
  opened_at: string | null;
  archived_at: string | null;
  tags: string[] | null;
  photo_paths: string[] | null;
  created_at: string;
}

/** Columns a sealed-capsule edit is allowed to touch — see updateCapsule. */
export interface CapsulePatch {
  title?: string;
  message?: string;
  unlock_method?: UnlockMethod;
  unlock_date?: string | null;
  unlock_lat?: number | null;
  unlock_lng?: number | null;
  unlock_location_label?: string | null;
  unlock_radius_meters?: number;
  photo_paths?: string[];
  tags?: string[];
}

// Cards show a decorative gradient rather than the real photo (which is
// private, in storage, and only shown once the capsule is opened). Picked
// deterministically from the id so a capsule always looks the same.
const GRADIENTS = [
  "from-sun via-coral to-sky",
  "from-sky via-sky-deep to-ink",
  "from-coral via-sun to-sky",
  "from-sky via-coral to-sun",
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

// Date-only capsules unlock by the clock, so that's computed here. Anything
// involving a place is decided by lib/checkLocationCapsules.ts, which needs
// the user's position and writes the result to the `status` column.
function computeStatus(row: CapsuleRow): CapsuleStatus {
  if (row.status === "unlocked") return "unlocked";
  if (row.unlock_method !== "date" || !row.unlock_date) return "sealed";
  return new Date(row.unlock_date) <= new Date() ? "unlocked" : "sealed";
}

export function toCapsule(row: CapsuleRow): Capsule {
  const usesPlace = row.unlock_method !== "date";
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    photoGradient: gradientFor(row.id),
    photoPaths: row.photo_paths ?? [],
    status: computeStatus(row),
    tags: row.tags ?? [],
    archivedAt: row.archived_at ?? undefined,
    openedAt: row.opened_at ?? undefined,
    unlockMethod: row.unlock_method,
    unlockDate: row.unlock_date ?? undefined,
    unlockLocation: row.unlock_location_label
      ? {
          label: row.unlock_location_label,
          lat: row.unlock_lat ?? undefined,
          lng: row.unlock_lng ?? undefined,
        }
      : undefined,
    unlockRadiusMeters: usesPlace ? row.unlock_radius_meters : undefined,
    createdAt: row.created_at,
  };
}

/** Union of every tag the user has used so far, for the tag-input's suggestion list. */
export async function listAllTags(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from("capsules").select("tags");
  if (error) throw error;
  const set = new Set<string>();
  for (const row of (data ?? []) as { tags: string[] | null }[]) {
    for (const tag of row.tags ?? []) set.add(tag);
  }
  return [...set].sort();
}

/** Toggles archive state. Reversible, so no confirmation dialog is needed at the call site. */
export async function archiveCapsule(
  supabase: SupabaseClient,
  id: string,
  archived: boolean
): Promise<void> {
  const { error } = await supabase
    .from("capsules")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

/** Permanently removes a capsule and its photos. Irreversible — gate behind a typed confirmation. */
export async function deleteCapsule(supabase: SupabaseClient, capsule: Capsule): Promise<void> {
  if (capsule.photoPaths.length > 0) {
    // Best effort: an orphaned file in storage is a much smaller problem
    // than blocking the delete the user actually asked for.
    await removeCapsulePhotos(supabase, capsule.photoPaths).catch(() => {});
  }
  const { error } = await supabase.from("capsules").delete().eq("id", capsule.id);
  if (error) throw error;
}

/**
 * Edits a still-sealed capsule. The `.eq("status", "sealed")` guard makes this
 * race-safe against the capsule unlocking between page load and save (same
 * pattern as the conditional update in lib/checkLocationCapsules.ts): if it
 * already unlocked, this matches zero rows and returns null rather than
 * throwing, so the caller can show a specific "already unlocked" message.
 */
export async function updateCapsule(
  supabase: SupabaseClient,
  id: string,
  patch: CapsulePatch
): Promise<Capsule | null> {
  const { data, error } = await supabase
    .from("capsules")
    .update(patch)
    .eq("id", id)
    .eq("status", "sealed")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? toCapsule(data as CapsuleRow) : null;
}

/** Marks a capsule opened the first time its message is actually revealed (distinct from `status` unlocking). */
export async function recordCapsuleOpen(
  supabase: SupabaseClient,
  capsuleId: string,
  userId: string,
  email: string
): Promise<void> {
  const { error: insertError } = await supabase
    .from("capsule_opens")
    .insert({ capsule_id: capsuleId, user_id: userId, opened_by_email: email });
  if (insertError) throw insertError;

  // Guarded so a re-visit never overwrites the first-open timestamp.
  const { error: updateError } = await supabase
    .from("capsules")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", capsuleId)
    .is("opened_at", null);
  if (updateError) throw updateError;
}
