"use client";

import { useEffect, useState } from "react";

export interface Coords {
  lat: number;
  lng: number;
  /** Radius of uncertainty in meters, as reported by the browser. */
  accuracy: number;
}

export type GeolocationErrorCode = "unsupported" | "denied" | "unavailable" | "timeout";

export interface GeolocationFailure {
  code: GeolocationErrorCode;
  message: string;
}

export interface GeolocationState {
  coords: Coords | null;
  error: GeolocationFailure | null;
  loading: boolean;
}

const FAILURE_BY_CODE: Record<number, GeolocationFailure> = {
  1: { code: "denied", message: "Location permission was denied." },
  2: { code: "unavailable", message: "Your location couldn't be determined." },
  3: { code: "timeout", message: "Finding your location took too long." },
};

/**
 * Asks the browser for the current position once, on mount. Never throws:
 * an unsupported browser or a denied permission just ends up in `error` with
 * `coords` still null, so callers can treat location as optional.
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({
        coords: null,
        error: { code: "unsupported", message: "This browser doesn't support location." },
        loading: false,
      });
      return;
    }

    let active = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!active) return;
        setState({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          error: null,
          loading: false,
        });
      },
      (err) => {
        if (!active) return;
        setState({
          coords: null,
          error: FAILURE_BY_CODE[err.code] ?? FAILURE_BY_CODE[2],
          loading: false,
        });
      },
      // Coarse, cached-ok fix: we only need "roughly here", not turn-by-turn,
      // and it keeps the permission prompt from draining a phone battery.
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );

    return () => {
      active = false;
    };
  }, []);

  return state;
}
