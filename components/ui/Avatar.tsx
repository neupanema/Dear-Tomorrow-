"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/lib/useProfile";

interface AvatarProps {
  /** Shown as the fallback initial while there's no picture. */
  email: string | null;
  size?: "sm" | "lg";
  className?: string;
}

const SIZE = {
  sm: "w-8 h-8 text-body",
  lg: "w-11 h-11 lg:w-16 lg:h-16 text-lead lg:text-heading",
};

/** The signed-in user's picture, or their email's first letter until they set one. */
export default function Avatar({ email, size = "sm", className = "" }: AvatarProps) {
  const { avatarUrl } = useProfile();
  // If the URL 404s (a stale link, a removed file) fall back to the initial
  // rather than leaving a permanently broken image icon on screen.
  const [broken, setBroken] = useState(false);
  // A fresh URL (a new upload, or the picture being removed) deserves a
  // fresh attempt rather than staying stuck from an earlier failure.
  useEffect(() => setBroken(false), [avatarUrl]);
  const showImage = !!avatarUrl && !broken;

  return (
    <span
      className={`shrink-0 rounded-full overflow-hidden bg-accent text-on-accent flex items-center justify-center font-display ${SIZE[size]} ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        email?.[0]?.toUpperCase() ?? "?"
      )}
    </span>
  );
}
