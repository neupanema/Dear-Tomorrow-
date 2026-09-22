"use client";

import { LocateFixed, MapPin, Search } from "lucide-react";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import Icon from "@/components/ui/Icon";
import { pinIcon } from "@/components/map/pinIcon";
import { useGeolocation } from "@/lib/useGeolocation";
import type { LocationPoint } from "@/lib/types";

interface LocationPickerProps {
  /** Called every time the pin moves, and again when its label has been looked up. */
  onChange?: (point: LocationPoint) => void;
  /** Pin to show when the picker mounts (e.g. coming back to this step). */
  value?: LocationPoint | null;
}

// Middle of the contiguous US, used until we know where the user is.
const FALLBACK_CENTER: [number, number] = [39.8283, -98.5795];
const FALLBACK_ZOOM = 4;
const PICKED_ZOOM = 15;

const NOMINATIM = "https://nominatim.openstreetmap.org";

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

/** "Central Park, Manhattan, New York County, ..." -> first three parts. */
function shortLabel(displayName: string): string {
  return displayName.split(", ").slice(0, 3).join(", ");
}

function coordsLabel(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      // wrap() keeps lng within ±180 if the user has panned across the antimeridian.
      const { lat, lng } = e.latlng.wrap();
      onPlace(lat, lng);
    },
  });
  return null;
}

function FlyTo({ view }: { view: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    // The map mounts while the step is still sliding in; re-measure once.
    map.invalidateSize();
  }, [map]);
  useEffect(() => {
    if (view) map.flyTo([view.lat, view.lng], view.zoom);
  }, [map, view]);
  return null;
}

export default function LocationPicker({ onChange, value }: LocationPickerProps) {
  const { coords } = useGeolocation();
  const [pin, setPin] = useState<LocationPoint | null>(value ?? null);
  const [view, setView] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const centeredOnUser = useRef(false);
  const reverseAbort = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searchError, setSearchError] = useState(false);

  // Start the map on the user's location if they allow it, but never yank
  // it away from a pin they've already placed.
  useEffect(() => {
    if (!coords || pin || centeredOnUser.current) return;
    centeredOnUser.current = true;
    setView({ lat: coords.lat, lng: coords.lng, zoom: 14 });
  }, [coords, pin]);

  useEffect(() => () => reverseAbort.current?.abort(), []);

  async function reverseGeocode(lat: number, lng: number) {
    reverseAbort.current?.abort();
    const controller = new AbortController();
    reverseAbort.current = controller;
    try {
      const res = await fetch(
        `${NOMINATIM}/reverse?format=jsonv2&zoom=18&lat=${lat}&lon=${lng}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error(String(res.status));
      const data: { display_name?: string } = await res.json();
      const label = data.display_name ? shortLabel(data.display_name) : coordsLabel(lat, lng);
      setPin({ lat, lng, label });
      onChange?.({ lat, lng, label });
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // superseded by a newer pin
      // Geocoding is a nicety; the coordinates are what matter.
      const label = coordsLabel(lat, lng);
      setPin({ lat, lng, label });
      onChange?.({ lat, lng, label });
    }
  }

  function place(lat: number, lng: number, label?: string) {
    setPin({ lat, lng, label });
    onChange?.({ lat, lng, label });
    if (label) {
      reverseAbort.current?.abort(); // label already known (from search)
    } else {
      void reverseGeocode(lat, lng);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    setSearchError(false);
    try {
      const res = await fetch(`${NOMINATIM}/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(String(res.status));
      setResults((await res.json()) as SearchResult[]);
    } catch {
      setResults(null);
      setSearchError(true);
    } finally {
      setSearching(false);
    }
  }

  function pickResult(r: SearchResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    place(lat, lng, shortLabel(r.display_name));
    setView({ lat, lng, zoom: PICKED_ZOOM });
    setResults(null);
    setQuery("");
  }

  function useMyLocation() {
    if (!coords) return;
    place(coords.lat, coords.lng);
    setView({ lat: coords.lat, lng: coords.lng, zoom: PICKED_ZOOM });
  }

  const initialCenter: [number, number] = value
    ? [value.lat, value.lng]
    : FALLBACK_CENTER;

  return (
    <div>
      <form
        onSubmit={handleSearch}
        role="search"
        className="flex items-center gap-2 bg-surface border border-line rounded-xl pl-3 pr-1 mb-3 text-ink-soft"
      >
        <Icon as={Search} size="sm" />
        <label htmlFor="place-search" className="sr-only">
          Search for a place
        </label>
        <input
          id="place-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place"
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent py-3 text-body text-ink placeholder:text-ink-soft"
        />
        <button
          type="submit"
          disabled={!query.trim() || searching}
          className="px-3 py-2 text-body font-bold text-accent disabled:opacity-40"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      <div aria-live="polite">
        {results && results.length === 0 && (
          <p className="text-caption text-ink-soft mb-3">No places found. Try a different search.</p>
        )}
        {searchError && (
          <p className="text-caption text-ink-soft mb-3">
            Search isn&apos;t available right now. You can still tap the map.
          </p>
        )}
      </div>
      {results && results.length > 0 && (
        <ul className="bg-surface border border-line rounded-xl mb-3 divide-y divide-line overflow-hidden">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onClick={() => pickResult(r)}
                className="w-full text-left px-3 py-2 text-body text-ink hover:bg-tint"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* isolate: Leaflet's panes use z-indexes up to 1000, which would
          otherwise paint over the toast and the bottom nav. */}
      <div
        role="group"
        aria-label="Map. Tap to drop a pin. Arrow keys pan the map, plus and minus zoom."
        className="isolate relative h-64 lg:h-80 rounded-2xl overflow-hidden"
      >
        <MapContainer
          center={initialCenter}
          zoom={value ? PICKED_ZOOM : FALLBACK_ZOOM}
          scrollWheelZoom
          className="h-full w-full cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPlace={(lat, lng) => place(lat, lng)} />
          <FlyTo view={view} />
          {pin && (
            <Marker
              position={[pin.lat, pin.lng]}
              icon={pinIcon("picked")}
              draggable
              keyboard={false}
              eventHandlers={{
                dragend(e) {
                  const { lat, lng } = (e.target as L.Marker).getLatLng().wrap();
                  place(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between gap-3 mt-2 min-h-[2rem]">
        <p className="text-caption text-ink-soft flex items-center gap-1 min-w-0" aria-live="polite">
          <Icon as={MapPin} size="sm" />
          <span className="truncate">
            {pin ? pin.label ?? "Looking up this place..." : "Tap anywhere on the map to drop a pin"}
          </span>
        </p>
        {coords && (
          <button
            type="button"
            onClick={useMyLocation}
            className="shrink-0 flex items-center gap-1 text-caption font-bold text-accent py-1"
          >
            <Icon as={LocateFixed} size="sm" />
            Use my location
          </button>
        )}
      </div>
    </div>
  );
}
