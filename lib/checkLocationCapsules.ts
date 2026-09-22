import { createClient } from "@/lib/supabase/client";
import { distanceMeters } from "@/lib/utils";

/** How close (in meters) the user has to be to a capsule's spot to open it. */
export const UNLOCK_RADIUS_METERS = 300;

export interface UnlockedCapsule {
  id: string;
  title: string;
}

interface PlaceCapsuleRow {
  id: string;
  title: string;
  unlock_method: "place" | "date-and-place";
  unlock_date: string | null;
  unlock_lat: number | null;
  unlock_lng: number | null;
}

/**
 * Unlocks every sealed place-based capsule the user is standing near.
 * - "place": within UNLOCK_RADIUS_METERS of the saved spot.
 * - "date-and-place": same, and unlock_date must already have passed.
 * Returns the capsules that were unlocked by this call (empty if none).
 * Throws on a Supabase error so the caller decides whether to surface it.
 */
export async function checkLocationCapsules(current: {
  lat: number;
  lng: number;
}): Promise<UnlockedCapsule[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("capsules")
    .select("id, title, unlock_method, unlock_date, unlock_lat, unlock_lng")
    .eq("status", "sealed")
    .in("unlock_method", ["place", "date-and-place"]);
  if (error) throw error;

  const now = Date.now();
  const matchedIds = ((data ?? []) as PlaceCapsuleRow[])
    .filter((c) => {
      if (c.unlock_lat === null || c.unlock_lng === null) return false;
      if (c.unlock_method === "date-and-place") {
        if (!c.unlock_date || new Date(c.unlock_date).getTime() > now) return false;
      }
      const meters = distanceMeters(current, { lat: c.unlock_lat, lng: c.unlock_lng });
      return meters <= UNLOCK_RADIUS_METERS;
    })
    .map((c) => c.id);

  if (matchedIds.length === 0) return [];

  // Re-assert status = 'sealed' and read back the updated rows: if two checks
  // race (e.g. two open tabs), only the one that actually flipped a capsule
  // gets it back, so the same capsule is never announced twice.
  const { data: updated, error: updateError } = await supabase
    .from("capsules")
    .update({ status: "unlocked", unlocked_at: new Date().toISOString() })
    .in("id", matchedIds)
    .eq("status", "sealed")
    .select("id, title");
  if (updateError) throw updateError;

  return (updated ?? []) as UnlockedCapsule[];
}
