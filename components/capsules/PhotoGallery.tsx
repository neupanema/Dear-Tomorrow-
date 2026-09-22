"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PhotoGalleryProps {
  urls: string[];
}

/**
 * One big photo, with the rest as a tappable filmstrip underneath (only
 * shown once there's more than one). Switching photos crossfades instead of
 * hard-cutting, and the active thumbnail gets the same accent border used
 * for "selected" states elsewhere in the app (see /map's list rows).
 */
export default function PhotoGallery({ urls }: PhotoGalleryProps) {
  const [active, setActive] = useState(0);
  if (urls.length === 0) return null;
  const index = Math.min(active, urls.length - 1);

  return (
    <div className="mb-3">
      <div className="relative h-56 lg:h-72 rounded-2xl overflow-hidden bg-tint">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={urls[index]}
            src={urls[index]}
            alt={urls.length > 1 ? `Photo ${index + 1} of ${urls.length}` : "Your photo from that day"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      {urls.length > 1 && (
        <div role="tablist" aria-label="Photos" className="flex gap-2 mt-2">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1} of ${urls.length}`}
              onClick={() => setActive(i)}
              className={`h-14 w-14 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                i === index ? "border-accent" : "border-transparent opacity-70"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
