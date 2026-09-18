import { Bell } from "lucide-react";
import Icon from "./Icon";

interface BrandMarkProps {
  size?: "sm" | "lg";
  /** "solid" = sky-blue tile (on white), "light" = white tile (on sky). */
  tone?: "solid" | "light";
}

// The Dear Tomorrow logo tile. One place, so sidebar / sign-in / onboarding
// can't drift apart.
export default function BrandMark({ size = "sm", tone = "solid" }: BrandMarkProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center ${
        size === "lg" ? "w-16 h-16 rounded-2xl" : "w-9 h-9 rounded-xl"
      } ${tone === "solid" ? "bg-accent text-on-accent" : "bg-white text-sky-deep"}`}
    >
      <Icon as={Bell} size={size === "lg" ? "xl" : "sm"} />
    </span>
  );
}
