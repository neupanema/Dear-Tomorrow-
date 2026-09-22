import { Capsule, CapsuleStatus, UnlockMethod } from "@/lib/types";

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
  status: CapsuleStatus;
  unlocked_at: string | null;
  photo_path: string | null;
  created_at: string;
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
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    photoGradient: gradientFor(row.id),
    photoPath: row.photo_path ?? undefined,
    status: computeStatus(row),
    unlockMethod: row.unlock_method,
    unlockDate: row.unlock_date ?? undefined,
    unlockLocation: row.unlock_location_label
      ? {
          label: row.unlock_location_label,
          lat: row.unlock_lat ?? undefined,
          lng: row.unlock_lng ?? undefined,
        }
      : undefined,
    createdAt: row.created_at,
  };
}
