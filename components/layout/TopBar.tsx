import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Icon from "@/components/ui/Icon";

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
    <header
      data-on-sky={isBrand ? "" : undefined}
      className={`relative px-4 pt-4 pb-4 lg:px-10 lg:pt-10 lg:pb-8 ${
        isBrand
          ? "bg-sky lg:rounded-b-[2.5rem]"
          : "bg-surface border-b border-line lg:border-0"
      }`}
    >
      {backHref && (
        <Link
          href={backHref}
          className={`absolute left-2 top-2 lg:left-8 lg:top-8 p-2 rounded-full ${isBrand ? "text-white" : "text-ink"}`}
          aria-label="Go back"
        >
          <Icon as={ChevronLeft} size="md" />
        </Link>
      )}
      <h1
        className={`font-display text-heading lg:text-display ${backHref ? "text-center lg:text-left lg:pl-8" : ""} ${
          isBrand ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`text-body lg:text-lead mt-1 lg:mt-2 ${backHref ? "text-center lg:text-left lg:pl-8" : ""} ${
            isBrand ? "text-white/90" : "text-ink-soft"
          }`}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
