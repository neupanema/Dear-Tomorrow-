"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { EmptyMapIllustration } from "@/components/ui/EmptyIllustrations";
import type { MapPin } from "@/components/map/MemoryMap";
import { createClient } from "@/lib/supabase/client";
import { toCapsule, type CapsuleRow } from "@/lib/supabase/capsules";
import { useGeolocation } from "@/lib/useGeolocation";
import { UNLOCK_RADIUS_METERS } from "@/lib/checkLocationCapsules";
import { distanceKm, formatDistance, daysUntil, formatCountdown } from "@/lib/utils";
import { MapPin as MapPinIcon, Plus } from "lucide-react";

type Filter = "all" | "sealed" | "unlocked";

// Leaflet touches `window` on import, so the map can only load in the browser.
const MemoryMap = dynamic(() => import("@/components/map/MemoryMap"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-full w-full bg-map-land animate-pulse" />,
});

export default function MapPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [pins, setPins] = useState<MapPin[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapBox = useRef<HTMLDivElement>(null);

  // Optional: shows a "you are here" dot and distances. If location is denied
  // or unsupported, `coords` stays null and the page simply omits them.
  const { coords } = useGeolocation();

  useEffect(() => {
    let active = true;
    createClient()
      .from("capsules")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast(error.message, { variant: "error" });
          setPins([]);
          return;
        }
        const next: MapPin[] = [];
        for (const row of (data ?? []) as CapsuleRow[]) {
          const c = toCapsule(row);
          // Only capsules with real coordinates can be placed on a map.
          if (c.unlockLocation?.lat === undefined || c.unlockLocation.lng === undefined) continue;
          next.push({
            id: c.id,
            title: c.title,
            label: c.unlockLocation.label,
            status: c.status,
            lat: c.unlockLocation.lat,
            lng: c.unlockLocation.lng,
            unlockDate: c.unlockMethod === "date-and-place" ? c.unlockDate : undefined,
            unlockRadiusMeters: c.unlockRadiusMeters ?? UNLOCK_RADIUS_METERS,
          });
        }
        setPins(next);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = pins === null;
  const allPins = useMemo(() => pins ?? [], [pins]);
  const hasPlaceCapsules = allPins.length > 0;
  const visiblePins = useMemo(
    () => allPins.filter((p) => filter === "all" || p.status === filter),
    [allPins, filter]
  );
  const isEmpty = !loading && visiblePins.length === 0;

  function selectFromList(id: string) {
    setSelectedId(id);
    // On phones the list sits below the map; bring the map back into view.
    mapBox.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Two flavours of empty: nothing exists at all (invite the first one), or
  // the current filter just hides everything (offer a way back).
  const emptyOverlay = !hasPlaceCapsules ? (
    <EmptyState
      className="py-6"
      illustration={<EmptyMapIllustration className="w-44 h-auto" />}
      title="No places yet"
      body="Seal a capsule to a place and it'll wait for you on the map until you return."
      action={{ label: "Create a place capsule", icon: Plus, href: "/new-capsule" }}
    />
  ) : (
    <EmptyState
      className="py-6"
      illustration={
        <span className="w-14 h-14 rounded-2xl bg-tint text-accent flex items-center justify-center">
          <Icon as={MapPinIcon} size="lg" />
        </span>
      }
      title={filter === "sealed" ? "No sealed places" : "No opened places"}
      body="None of your place capsules match this filter."
      action={{ label: "Show all places", variant: "secondary", onClick: () => setFilter("all") }}
    />
  );

  return (
    <AppShell>
      <TopBar title="Map of memories" variant="plain" />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        {hasPlaceCapsules && (
          <div role="group" aria-label="Filter places" className="flex gap-2 mb-3 lg:mb-6">
            <Chip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
            <Chip
              label="Sealed"
              active={filter === "sealed"}
              onClick={() => setFilter("sealed")}
            />
            <Chip
              label="Opened"
              active={filter === "unlocked"}
              onClick={() => setFilter("unlocked")}
            />
          </div>
        )}

        {/* Mobile: map with the list underneath. Desktop: list beside the map. */}
        <div className="lg:flex lg:gap-6">
          <div className="lg:flex-1 min-w-0">
            {/* isolate: Leaflet's panes use z-indexes up to 1000, which would
                otherwise paint over the toast and the bottom nav. */}
            <div
              ref={mapBox}
              role="group"
              aria-label="Map of place capsules"
              className="isolate relative h-[340px] lg:h-[560px] rounded-2xl overflow-hidden bg-map-land"
            >
              <MemoryMap
                pins={visiblePins}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onClose={(id) => setSelectedId((cur) => (cur === id ? null : cur))}
                userPosition={coords}
              />
              {isEmpty && (
                <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-surface/75 backdrop-blur-[1px] overflow-y-auto">
                  {emptyOverlay}
                </div>
              )}
            </div>
            {hasPlaceCapsules && (
              <p className="flex items-center gap-4 text-caption text-ink-soft mt-2">
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-sky-deep" />
                  Sealed
                </span>
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-coral" />
                  Ready to open
                </span>
                {coords && (
                  <span className="flex items-center gap-1">
                    <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-[#2b7fff]" />
                    You
                  </span>
                )}
              </p>
            )}
          </div>

          {!isEmpty && hasPlaceCapsules && (
            <div className="mt-4 lg:mt-0 lg:w-72 shrink-0">
              <p className="text-caption font-bold text-ink-soft uppercase tracking-wide mb-3">
                {visiblePins.length} place{visiblePins.length === 1 ? "" : "s"}
              </p>
              <ul className="flex flex-col gap-3 lg:max-h-[520px] lg:overflow-y-auto">
                {visiblePins.map((pin) => {
                  const away =
                    coords && pin.status === "sealed"
                      ? formatDistance(distanceKm(coords, pin))
                      : null;
                  const countdown =
                    pin.status === "sealed" && pin.unlockDate && daysUntil(pin.unlockDate) > 0
                      ? formatCountdown(pin.unlockDate)
                      : null;
                  return (
                    <li key={pin.id}>
                      <button
                        type="button"
                        onClick={() => selectFromList(pin.id)}
                        aria-pressed={selectedId === pin.id}
                        className={`card w-full text-left flex items-center gap-3 transition-colors ${
                          selectedId === pin.id ? "!border-accent" : ""
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            pin.status === "unlocked" ? "bg-coral text-white" : "bg-tint text-accent"
                          }`}
                        >
                          <Icon as={MapPinIcon} size="sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-body text-ink truncate">{pin.title}</p>
                          <p className="text-caption text-ink-soft truncate">{pin.label}</p>
                          <p className="text-caption text-ink-soft">
                            {pin.status === "unlocked" ? "Ready to open" : countdown ?? "Sealed"}
                            {away && ` · ${away} away`}
                            {pin.status === "sealed" &&
                              ` · ${formatDistance(pin.unlockRadiusMeters / 1000)} radius`}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
