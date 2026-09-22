import L from "leaflet";

/**
 * sealed   - locked capsule waiting at a place (blue, lock)
 * opened   - capsule that's ready to open (red, sparkles, gentle pulse)
 * picked   - the spot being chosen in the new-capsule flow (red, heart)
 */
export type PinKind = "sealed" | "opened" | "picked";

const COLOR: Record<PinKind, string> = {
  sealed: "sky-deep",
  opened: "coral",
  picked: "coral",
};

// 24x24 glyph paths (Lucide shapes), drawn in the pin's own colour on a white disc.
const GLYPH: Record<PinKind, string> = {
  sealed: `<rect x="4" y="11" width="16" height="10" rx="2.5" fill="currentColor" stroke="none"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
  opened: `<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" fill="currentColor"/><path d="M19 15v4M17 17h4"/>`,
  picked: `<path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10z" fill="currentColor"/>`,
};

const cache = new Map<string, L.DivIcon>();

// Leaflet's stock marker loads PNGs by URL, which bundlers break, so the pin
// is inline SVG themed by CSS variables (it follows light/dark automatically).
// Styles live in app/globals.css under ".dt-pin". The tip of the drop sits on
// the coordinate. Only import this from client-only (ssr: false) code.
export function pinIcon(kind: PinKind, selected = false): L.DivIcon {
  const key = `${kind}:${selected}`;
  let icon = cache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: "dt-pin-wrap",
      iconSize: [40, 52],
      iconAnchor: [20, 50],
      popupAnchor: [0, -46],
      html: `<div class="dt-pin${selected ? " dt-pin--selected" : ""}" style="color:rgb(var(--${COLOR[kind]}))">
  ${kind === "opened" ? '<span class="dt-pin__pulse"></span>' : ""}
  <svg viewBox="0 0 40 52" width="40" height="52" aria-hidden="true">
    <path d="M20 2C10.06 2 2 10.06 2 20c0 13.6 18 30 18 30s18-16.4 18-30C38 10.06 29.94 2 20 2z" fill="currentColor" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="20" cy="20" r="12" fill="#fff"/>
    <svg x="12" y="12" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:rgb(var(--${COLOR[kind]}))">${GLYPH[kind]}</svg>
  </svg>
</div>`,
    });
    cache.set(key, icon);
  }
  return icon;
}
