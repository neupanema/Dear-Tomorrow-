"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Home, Map, Settings } from "lucide-react";
import Icon from "@/components/ui/Icon";

const TABS = [
  { href: "/dashboard", label: "Capsules", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/shared", label: "Shared", icon: Gift },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex border-t border-line bg-surface">
      {TABS.map(({ href, label, icon: Glyph }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-micro font-bold ${
              active ? "text-accent" : "text-ink-soft"
            }`}
          >
            <Icon as={Glyph} size="md" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
