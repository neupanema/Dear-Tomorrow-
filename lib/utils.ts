export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function daysAgo(iso: string): number {
  const created = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((now - created) / (1000 * 60 * 60 * 24)));
}

/**
 * Haversine distance between two lat/lng points, in kilometers.
 * This is the function you'll call once real geolocation comes in — pass
 * the user's current position and a capsule's saved unlockLocation, and
 * unlock it once the result is under whatever radius you choose (e.g. 0.2km).
 */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Stand-in for network latency while there's no backend. Replace calls to
 * this with the real request when the API exists.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Format check only (no DNS/mailbox lookup) — good enough to enable/disable a submit button. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
