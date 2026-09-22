"use client";

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

  return (
    <span
      className={`shrink-0 rounded-full overflow-hidden bg-accent text-on-accent flex items-center justify-center font-display ${SIZE[size]} ${className}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        email?.[0]?.toUpperCase() ?? "?"
      )}
    </span>
  );
}
