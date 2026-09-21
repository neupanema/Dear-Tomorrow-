import { Capsule, CapsuleStatus, UnlockMethod } from "@/lib/types";

// Shape of a row from the `capsules` table (see supabase/schema.sql).
export interface CapsuleRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  unlock_method: UnlockMethod;
  unlock_date: string | null;
  unlock_location_label: string | null;
  unlock_location_x: number | null;
  unlock_location_y: number | null;
  created_at: string;
}

// There's no real photo storage yet (PhotoDrop only previews locally — see
// its TODO), so cards still get a decorative gradient. Picked deterministically
// from the id so a given capsule always looks the same instead of reshuffling.
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

// A capsule unlocks automatically once its condition is met. Date-based
// conditions can be checked here; place-based ones can't yet because
// LocationPicker is a fake map (percent coordinates, no real geolocation) —
// so "place" and "date-and-place" stay sealed until that's built.
function computeStatus(row: CapsuleRow): CapsuleStatus {
  if (row.unlock_method !== "date") return "sealed";
  if (!row.unlock_date) return "sealed";
  return new Date(row.unlock_date) <= new Date() ? "unlocked" : "sealed";
}

export function toCapsule(row: CapsuleRow): Capsule {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    photoGradient: gradientFor(row.id),
    status: computeStatus(row),
    unlockMethod: row.unlock_method,
    unlockDate: row.unlock_date ?? undefined,
    unlockLocation: row.unlock_location_label
      ? { label: row.unlock_location_label }
      : undefined,
    createdAt: row.created_at,
  };
}
