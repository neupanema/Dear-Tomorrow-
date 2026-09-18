import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  /** Where the back arrow should go. Omit to hide the back button. */
  backHref?: string;
  /** "brand" = filled sky-blue header (dashboard). "plain" = white header (forms). */
  variant?: "brand" | "plain";
}

export default function TopBar({
  title,
  subtitle,
  backHref,
  variant = "brand",
}: TopBarProps) {
  const isBrand = variant === "brand";

  return (
    <div
      className={`relative px-4 pt-4 pb-4 lg:px-10 lg:pt-10 lg:pb-8 ${
        isBrand
          ? "bg-sky lg:rounded-b-[2.5rem]"
          : "bg-white border-b border-line lg:border-0"
      }`}
    >
      {backHref && (
        <Link
          href={backHref}
          className={`absolute left-4 top-4 lg:left-10 lg:top-10 ${isBrand ? "text-white" : "text-ink"}`}
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Link>
      )}
      <h1
        className={`font-display text-lg lg:text-3xl ${backHref ? "text-center lg:text-left" : ""} ${
          isBrand ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`text-xs lg:text-sm mt-0.5 lg:mt-1.5 ${backHref ? "text-center lg:text-left" : ""} ${
            isBrand ? "text-white/90" : "text-ink-soft"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
