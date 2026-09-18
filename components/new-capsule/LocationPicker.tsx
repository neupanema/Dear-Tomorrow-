"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import Icon from "@/components/ui/Icon";

interface LocationPickerProps {
  onChange?: (point: { xPercent: number; yPercent: number }) => void;
}

/**
 * This is a stand-in for a real map. It lets the user click anywhere on a
 * drawn "map" and drops a pin there, purely so the flow is clickable end to
 * end. When the backend/map SDK is ready, swap the <div onClick> block below
 * for something like react-map-gl or @react-google-maps/api, and turn the
 * xPercent/yPercent callback into real lat/lng from the map instance.
 */
export default function LocationPicker({ onChange }: LocationPickerProps) {
  const [pin, setPin] = useState<{ x: number; y: number } | null>({
    x: 44,
    y: 48,
  });

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    setPin({ x: xPercent, y: yPercent });
    onChange?.({ xPercent, yPercent });
  }

  return (
    <div>
      <div className="flex items-center gap-2 bg-white border border-line rounded-xl px-3 py-3 mb-3 text-ink-soft text-body">
        <Icon as={Search} size="sm" />
        <span>Search for a place</span>
      </div>

      <div
        onClick={handleClick}
        className="relative h-56 rounded-2xl overflow-hidden bg-[#DCEFE0] cursor-crosshair"
      >
        <div className="absolute left-0 right-0 top-[40%] h-2.5 bg-[#F5F1DD]" />
        <div className="absolute top-0 bottom-0 left-[35%] w-2.5 bg-[#F5F1DD]" />
        <div className="absolute left-[10%] top-[8%] w-[20%] h-[22%] bg-[#C9E3D0] rounded-sm" />
        <div className="absolute left-[50%] top-[15%] w-[28%] h-[18%] bg-[#C9E3D0] rounded-sm" />
        <div className="absolute left-[52%] top-[55%] w-[22%] h-[26%] bg-[#C9E3D0] rounded-sm" />
        <div className="absolute left-[8%] top-[58%] w-[18%] h-[24%] bg-[#C9E3D0] rounded-sm" />

        {pin && (
          <div
            className="absolute w-6 h-6 bg-coral rounded-tl-full rounded-tr-full rounded-bl-full flex items-center justify-center"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%, -100%) rotate(-45deg)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full rotate-45" />
          </div>
        )}
      </div>
      <p className="text-caption text-ink-soft text-center mt-2">
        Tap anywhere on the map to drop a pin
      </p>
    </div>
  );
}
