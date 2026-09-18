import { Capsule } from "./types";

// TEMPORARY: hardcoded capsules so every screen has something real to
// render. Delete this file once capsules come from your backend — every
// place that imports MOCK_CAPSULES is a place that will need to switch to
// a real fetch/query instead.
export const MOCK_CAPSULES: Capsule[] = [
  {
    id: "first-week-ulm",
    title: "First week at ULM",
    message:
      "Dear future me, I'm still figuring things out but I hope by now you've found your people here.",
    photoGradient: "from-sun via-coral to-sky",
    status: "unlocked",
    unlockMethod: "date",
    unlockDate: "2026-08-20",
    createdAt: "2025-08-20",
  },
  {
    id: "graduation-letter",
    title: "Graduation letter",
    message:
      "Dear future me, I hope you stuck with computer vision even when it got hard.",
    photoGradient: "from-sky via-sky-deep to-ink",
    status: "sealed",
    unlockMethod: "date",
    unlockDate: "2028-05-10",
    createdAt: "2026-09-01",
  },
  {
    id: "back-in-kathmandu",
    title: "Back in Kathmandu",
    message: "Dear future me, open this the next time you're home.",
    photoGradient: "from-coral via-sun to-sky",
    status: "sealed",
    unlockMethod: "place",
    unlockLocation: { label: "Kathmandu, Nepal", lat: 27.7172, lng: 85.324 },
    createdAt: "2026-06-15",
  },
  {
    id: "one-year-from-today",
    title: "One year from today",
    message: "Dear future me, what changed in a year?",
    photoGradient: "from-sky via-coral to-sun",
    status: "sealed",
    unlockMethod: "date",
    unlockDate: "2027-09-15",
    createdAt: "2026-09-15",
  },
];

export function getCapsuleById(id: string): Capsule | undefined {
  return MOCK_CAPSULES.find((c) => c.id === id);
}
