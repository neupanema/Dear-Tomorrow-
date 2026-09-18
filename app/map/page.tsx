"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import Chip from "@/components/ui/Chip";
import { MOCK_CAPSULES } from "@/lib/mock-data";
import { MapPin } from "lucide-react";

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
}: {
  placeCapsules: typeof MOCK_CAPSULES;
  heightClass: string;
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
    </div>
  );
}

export default function MapPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const placeCapsules = MOCK_CAPSULES.filter((c) => c.unlockLocation).filter(
    (c) => filter === "all" || c.status === filter
  );

  return (
    <AppShell>
      <TopBar title="Map of memories" variant="plain" />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        <div className="flex gap-1.5 mb-3 lg:mb-6">
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

        {/* Mobile: map only. Desktop: map + a list panel alongside it. */}
        <div className="lg:hidden">
          <MapArea placeCapsules={placeCapsules} heightClass="h-[340px]" />
        </div>

        <div className="hidden lg:flex lg:gap-6">
          <div className="flex-1">
            <MapArea placeCapsules={placeCapsules} heightClass="h-[560px]" />
          </div>
          <div className="w-72 shrink-0">
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-3">
              {placeCapsules.length} place{placeCapsules.length === 1 ? "" : "s"}
            </p>
            <div className="flex flex-col gap-2.5">
              {placeCapsules.map((capsule) => (
                <div key={capsule.id} className="card flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-sky-deep flex items-center justify-center flex-shrink-0">
                    <MapPin size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-ink truncate">{capsule.title}</p>
                    <p className="text-[10.5px] text-ink-soft truncate">
                      {capsule.unlockLocation?.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {placeCapsules.length === 0 && (
          <p className="text-center text-xs text-ink-soft mt-6">
            No place-based capsules yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}
