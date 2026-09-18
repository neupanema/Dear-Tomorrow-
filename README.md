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
  layout.tsx             ← wraps every page: loads fonts, applies the saved theme
  providers.tsx          ← motion settings, theme, and toast providers
  template.tsx           ← the fade + slide between routes
  page.tsx               ← the "/" route — just redirects to /onboarding
  globals.css            ← Tailwind setup, the light/dark color tokens, shared styles
  onboarding/page.tsx     → "/onboarding"      3-slide swipeable intro
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
    Icon.tsx                 lucide wrapper: the 16/20/24/32 size scale + aria-hidden
    Toast.tsx                snackbars: useToast().toast("...") from any component
    ThemeProvider/Toggle     light/dark, saved in localStorage
    EmptyState.tsx           illustration + one call to action, for empty screens
  layout/                 things that wrap a page (headers, nav)
    TopBar.tsx               the blue or white header bar with back button
    BottomNav.tsx            mobile-only tab bar (Capsules / Map / Settings)
    Sidebar.tsx              desktop-only left nav, replaces BottomNav at the lg breakpoint
    AppShell.tsx             puts Sidebar + BottomNav around a page automatically —
                             used by dashboard, map, and settings
  capsules/               things specific to displaying a capsule
    CapsuleCard.tsx          one row in the dashboard list
    FabButton.tsx            the round "+" button that starts a new capsule
    UnlockOrb.tsx            the tap-to-open crack + light burst
  new-capsule/            things specific to the "create a capsule" wizard
    StepIndicator.tsx        the little progress dots at the top
    MethodCard.tsx           the "On a date / At a place / ..." choice cards
    CapsuleCalendar.tsx      the custom date picker
    LocationPicker.tsx       the placeholder map you click to drop a pin
    ReviewSummary.tsx        the summary card on the last step
    SealAnimation.tsx        the capsule closing and locking when you seal

lib/                     ← code, not UI — shared logic and data shapes
  types.ts                 the Capsule type — this is what your database
                            schema / API responses should eventually match
  mock-data.ts              4 fake capsules so the app has something to show.
                            Delete this once real data comes from the backend.
  utils.ts                  small helpers: date formatting, and a
                            distanceKm() function ready for when you add
                            real location-based unlocking

tailwind.config.ts        ← color *names* (sky, coral, surface, accent, ...) and the
                            type scale. The color *values* are CSS variables in
                            app/globals.css: :root is "Doraemon Sky" and .dark is
                            "Midnight Time Capsule". Change a value there once
                            and it updates everywhere, in both themes.
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

## Design system notes

- **Type scale:** seven tiers (`text-micro` 10px, `caption` 11, `body` 13,
  `lead` 16, `heading` 20, `title` 24, `display` 32), each with its own
  line-height. Tailwind's default `text-sm` etc. are removed on purpose, so
  every size comes from this list.
- **Icons:** always `<Icon as={SomeLucideIcon} size="sm|md|lg|xl" />`, never a
  raw pixel size.
- **Dark mode:** class-based (`.dark` on `<html>`), chosen before first paint by
  a tiny script in `layout.tsx`. Use semantic tokens (`bg-surface`,
  `text-accent`, `bg-tint`), not `bg-white` / `text-sky-deep`, unless the
  element is white *on* a sky-blue background.
- **Contrast:** text pairs are meant to meet WCAG AA (4.5:1). `sky-deep`
  (#1B72BC) and `coral` (#D24444) were nudged darker than the original
  Doraemon Sky values for that reason. Bright `sky` can't carry white text, so
  sky-blue headers use navy text and full-bleed screens use `.bg-hero`, which
  reaches the deep blue by 40% down.
- **Async-looking actions** call `wait()` from `lib/utils.ts` to fake latency;
  swap those for the real request when the backend exists.
