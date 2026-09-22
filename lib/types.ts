// Central place for shapes of data. When the backend is ready, this is the
// file that should match your database schema / API responses — everything
// else in the app imports from here instead of re-declaring shapes.

export type UnlockMethod = "date" | "place" | "date-and-place";

export type CapsuleStatus = "sealed" | "unlocked";

export interface Capsule {
  id: string;
  title: string;
  message: string;
  /** Tailwind gradient classes standing in for a real uploaded photo. */
  photoGradient: string;
  /** Storage paths of the uploaded photos (up to FREE_PHOTO_LIMIT — see lib/photos.ts). */
  photoPaths: string[];
  status: CapsuleStatus;
  unlockMethod: UnlockMethod;
  unlockDate?: string; // ISO date string
  unlockLocation?: {
    label: string;
    lat?: number;
    lng?: number;
  };
  createdAt: string; // ISO date string
}

/** A spot picked on the map in components/new-capsule/LocationPicker.tsx. */
export interface LocationPoint {
  lat: number;
  lng: number;
  /** Human-readable name from reverse geocoding; absent until it resolves (or if it fails). */
  label?: string;
}
