# Dear Tomorrow — frontend

This is the Next.js frontend for Dear Tomorrow, built from the "Doraemon Sky"
design. It's frontend-only right now — everything runs on mock data in
`lib/mock-data.ts` so every screen works and is clickable, but nothing is
actually saved anywhere yet. Every spot that needs a real backend call has a
`// TODO` comment explaining exactly what to swap in.

## Running it

```
npm install
npm run dev
```

Then open http://localhost:3000 — it starts on the onboarding screen and
flows through sign-in → dashboard → new capsule → sealed/unlocked, same as
the mockups.

## How the folders are organized

Next.js (App Router) uses **folders as URLs**. If you see `app/dashboard/page.tsx`,
that file is what renders at `yoursite.com/dashboard`. That's the whole trick —
once you know that, the rest of the structure reads itself.

```
app/                     ← every folder in here is a page/URL
  layout.tsx             ← wraps every page: loads fonts, sets the background
  page.tsx               ← the "/" route — just redirects to /onboarding
  globals.css            ← Tailwind setup + a few shared button/card styles
  onboarding/page.tsx     → "/onboarding"      welcome screen
  sign-in/page.tsx        → "/sign-in"         email/password form
  dashboard/page.tsx      → "/dashboard"       capsule list, the home screen
  new-capsule/page.tsx    → "/new-capsule"     the 4-step "create a capsule" wizard
  capsule/[id]/page.tsx   → "/capsule/anything" capsule detail — the [id] means
                                                 it matches ANY id, like a template
  map/page.tsx            → "/map"             bonus: pins for place-based capsules
  settings/page.tsx       → "/settings"        account + settings list

components/              ← reusable pieces that pages are built out of
  ui/                     generic, dumb building blocks used everywhere
    Button.tsx              the pill-shaped buttons (primary/secondary/white)
    Chip.tsx                the small "All / Sealed / Opened" filter pills
    PhotoDrop.tsx            the photo upload box with a live preview
  layout/                 things that wrap a page (headers, nav)
    TopBar.tsx               the blue or white header bar with back button
    BottomNav.tsx            mobile-only tab bar (Capsules / Map / Settings)
    Sidebar.tsx              desktop-only left nav, replaces BottomNav at the lg breakpoint
    AppShell.tsx             puts Sidebar + BottomNav around a page automatically —
                             used by dashboard, map, and settings
  capsules/               things specific to displaying a capsule
    CapsuleCard.tsx          one row in the dashboard list
    FabButton.tsx            the round "+" button that starts a new capsule
  new-capsule/            things specific to the "create a capsule" wizard
    StepIndicator.tsx        the little progress dots at the top
    MethodCard.tsx           the "On a date / At a place / ..." choice cards
    CapsuleCalendar.tsx      the custom date picker
    LocationPicker.tsx       the placeholder map you click to drop a pin
    ReviewSummary.tsx        the summary card on the last step

lib/                     ← code, not UI — shared logic and data shapes
  types.ts                 the Capsule type — this is what your database
                            schema / API responses should eventually match
  mock-data.ts              4 fake capsules so the app has something to show.
                            Delete this once real data comes from the backend.
  utils.ts                  small helpers: date formatting, and a
                            distanceKm() function ready for when you add
                            real location-based unlocking

tailwind.config.ts        ← the Doraemon Sky colors live here (sky, coral, sun,
                            ink, cream). Change a color once here and it
                            updates everywhere in the app.
```

## Mobile vs. desktop

Everything is responsive using Tailwind's `lg:` breakpoint (1024px+):

- **Dashboard / Map / Settings** use `AppShell`, which shows a left `Sidebar`
  below 1024px and swaps to the mobile `BottomNav` — you don't have to think
  about it in the page itself, just wrap the page in `<AppShell>`.
- **Onboarding / Sign in** become a split screen on desktop (brand on the
  left, the actual screen on the right) instead of one narrow gradient panel.
- **New capsule** gets a live preview panel on the right on desktop, showing
  what the sealed capsule will look like as you fill the form in.
- **Capsule detail / Map** get bigger type, bigger icons, and (on the map)
  a list panel next to the map instead of just the map alone.

If you add a new page, either wrap it in `<AppShell>` (if it belongs in the
main app with sidebar nav) or follow the split-screen pattern from
`sign-in/page.tsx` (if it's a standalone flow screen).

## What's mocked vs. what's real

- **Working right now:** navigation between every screen, the multi-step
  capsule form (with real local state), the calendar, the photo preview,
  filtering the dashboard/map by sealed vs. opened.
- **Still fake, waiting on backend:** signing in doesn't check a real
  account, sealing a capsule doesn't save anything, the map uses a hand-drawn
  placeholder instead of a real map SDK, and "unlocking" a capsule is really
  just whatever `status` is hardcoded in `mock-data.ts`.

## Wiring up the backend later

The places to touch are already marked with `// TODO` comments:

- `app/sign-in/page.tsx` — swap the fake `router.push` for a real Supabase
  Auth / NextAuth call.
- `app/new-capsule/page.tsx` (`handleSeal`) — POST the form state to your
  capsules table/API instead of just flipping `sealed` to true.
- `components/ui/PhotoDrop.tsx` — upload the file to storage instead of only
  making a local preview.
- `components/new-capsule/LocationPicker.tsx` and `app/map/page.tsx` — swap
  the hand-drawn map for a real map SDK (e.g. `react-map-gl` or
  `@react-google-maps/api`) once you have an API key.
- `lib/mock-data.ts` — replace with a real fetch/query once there's a
  database to query.
