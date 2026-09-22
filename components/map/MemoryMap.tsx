"use client";

import L from "leaflet";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { pinIcon } from "@/components/map/pinIcon";
import { UNLOCK_RADIUS_METERS } from "@/lib/checkLocationCapsules";
import type { CapsuleStatus } from "@/lib/types";

export interface MapPin {
  id: string;
  title: string;
  label: string;
  status: CapsuleStatus;
  lat: number;
  lng: number;
}

interface MemoryMapProps {
  pins: MapPin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** A pin's popup closed (map click, close button, or another pin opened). */
  onClose: (id: string) => void;
  userPosition: { lat: number; lng: number } | null;
}

// Middle of the contiguous US, shown behind the "no places yet" overlay.
const FALLBACK_CENTER: [number, number] = [39.8283, -98.5795];
const FALLBACK_ZOOM = 4;

/** Keeps the viewport framing whichever pins are currently shown. */
function FitToPins({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  const key = pins.map((p) => p.id).join(",");

  useEffect(() => {
    map.invalidateSize();
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 14);
    } else {
      map.fitBounds(
        L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])),
        { padding: [48, 48], maxZoom: 15 }
      );
    }
    // Re-fit only when the set of pins changes, not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);

  return null;
}

export default function MemoryMap({ pins, selectedId, onSelect, onClose, userPosition }: MemoryMapProps) {
  const markers = useRef(new Map<string, L.Marker>());
  const selected = pins.find((p) => p.id === selectedId) ?? null;

  // Selecting from the list opens that pin's popup (Leaflet then pans it into
  // view). The isPopupOpen guard matters: a pin click also lands here via
  // onSelect, and re-opening an open popup would fire close -> open again.
  useEffect(() => {
    if (!selectedId) return;
    const marker = markers.current.get(selectedId);
    if (marker && !marker.isPopupOpen()) marker.openPopup();
  }, [selectedId]);

  return (
    <MapContainer
      center={FALLBACK_CENTER}
      zoom={FALLBACK_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToPins pins={pins} />

      {/* Shows the area (in meters) where a sealed capsule will open. */}
      {selected?.status === "sealed" && (
        <Circle
          center={[selected.lat, selected.lng]}
          radius={UNLOCK_RADIUS_METERS}
          pathOptions={{ className: "dt-radius", weight: 2, fillOpacity: 0.15 }}
        />
      )}

      {userPosition && (
        <CircleMarker
          center={[userPosition.lat, userPosition.lng]}
          radius={8}
          pathOptions={{ className: "dt-user", weight: 3, fillOpacity: 1 }}
          interactive={false}
        />
      )}

      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={pinIcon(pin.status === "unlocked" ? "opened" : "sealed", pin.id === selectedId)}
          zIndexOffset={pin.id === selectedId ? 1000 : 0}
          title={pin.title}
          ref={(m) => {
            if (m) markers.current.set(pin.id, m);
            else markers.current.delete(pin.id);
          }}
          eventHandlers={{
            popupopen: () => onSelect(pin.id),
            popupclose: () => onClose(pin.id),
          }}
        >
          <Popup>
            <div className="font-body">
              <div className="font-bold text-body">{pin.title}</div>
              <div className="text-caption text-ink-soft mb-2">{pin.label}</div>
              <div className="text-caption mb-2">
                {pin.status === "unlocked" ? "Ready to open" : "Sealed until you return here"}
              </div>
              <Link href={`/capsule/${pin.id}`} className="!text-accent font-bold text-caption underline">
                {pin.status === "unlocked" ? "Open capsule" : "View capsule"}
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
