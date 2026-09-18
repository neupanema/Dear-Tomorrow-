"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import { EmptyMapIllustration } from "@/components/ui/EmptyIllustrations";
import { MOCK_CAPSULES } from "@/lib/mock-data";
import { MapPin, Plus } from "lucide-react";

type Filter = "all" | "sealed" | "unlocked";

// Pins are laid out with hardcoded percentages just to match the mockup.
// Swap this whole component's map area for a real map SDK
// (react-map-gl, @react-google-maps/api, etc.) once the backend supplies
// real lat/lng per capsule.
const PIN_POSITIONS = [
  { left: "30%", top: "40%", color: "bg-coral" },
  { left: "70%", top: "50%", color: "bg-sky-deep" },
  { left: "50%", top: "20%", color: "bg-sun" },
];

function MapArea({
  placeCapsules,
  heightClass,
  overlay,
}: {
  placeCapsules: typeof MOCK_CAPSULES;
  heightClass: string;
  /** Shown centred over a dimmed map (used for empty states). */
  overlay?: React.ReactNode;
}) {
  return (
    <div className={`relative ${heightClass} rounded-2xl overflow-hidden bg-[#DCEFE0]`}>
      <div className="absolute left-0 right-0 top-[30%] h-2.5 bg-[#F5F1DD]" />
      <div className="absolute left-0 right-0 top-[65%] h-2.5 bg-[#F5F1DD]" />
      <div className="absolute top-0 bottom-0 left-[25%] w-2.5 bg-[#F5F1DD]" />
      <div className="absolute top-0 bottom-0 left-[65%] w-2.5 bg-[#F5F1DD]" />
      <div className="absolute left-[5%] top-[5%] w-[15%] h-[18%] bg-[#C9E3D0] rounded-sm" />
      <div className="absolute left-[35%] top-[8%] w-[24%] h-[16%] bg-[#C9E3D0] rounded-sm" />
      <div className="absolute left-[72%] top-[10%] w-[22%] h-[14%] bg-[#C9E3D0] rounded-sm" />
      <div className="absolute left-[8%] top-[70%] w-[18%] h-[20%] bg-[#C9E3D0] rounded-sm" />
      <div className="absolute left-[40%] top-[72%] w-[20%] h-[20%] bg-[#C9E3D0] rounded-sm" />

      {placeCapsules.map((capsule, i) => {
        const pos = PIN_POSITIONS[i % PIN_POSITIONS.length];
        return (
          <div
            key={capsule.id}
            title={capsule.title}
            className={`absolute w-6 h-6 rounded-tl-full rounded-tr-full rounded-bl-full ${pos.color}`}
            style={{
              left: pos.left,
              top: pos.top,
              transform: "translate(-50%, -100%) rotate(-45deg)",
            }}
          />
        );
      })}

      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[1px] overflow-y-auto">
          {overlay}
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const allPlaceCapsules = MOCK_CAPSULES.filter((c) => c.unlockLocation);
  const hasPlaceCapsules = allPlaceCapsules.length > 0;
  const placeCapsules = allPlaceCapsules.filter(
    (c) => filter === "all" || c.status === filter
  );
  const isEmpty = placeCapsules.length === 0;

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
        <span className="w-14 h-14 rounded-2xl bg-[#EAF6FF] text-sky-deep flex items-center justify-center">
          <Icon as={MapPin} size="lg" />
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
          <div className="flex gap-2 mb-3 lg:mb-6">
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

        {/* Mobile: map only. Desktop: map + a list panel alongside it. */}
        <div className="lg:hidden">
          <MapArea placeCapsules={placeCapsules} heightClass="h-[340px]" overlay={isEmpty ? emptyOverlay : undefined} />
        </div>

        <div className="hidden lg:flex lg:gap-6">
          <div className="flex-1">
            <MapArea placeCapsules={placeCapsules} heightClass="h-[560px]" overlay={isEmpty ? emptyOverlay : undefined} />
          </div>
          {!isEmpty && (
            <div className="w-72 shrink-0">
              <p className="text-caption font-bold text-ink-soft uppercase tracking-wide mb-3">
                {placeCapsules.length} place{placeCapsules.length === 1 ? "" : "s"}
              </p>
              <div className="flex flex-col gap-3">
                {placeCapsules.map((capsule) => (
                  <div key={capsule.id} className="card flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-sky-deep flex items-center justify-center flex-shrink-0">
                      <Icon as={MapPin} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-body text-ink truncate">{capsule.title}</p>
                      <p className="text-caption text-ink-soft truncate">
                        {capsule.unlockLocation?.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
