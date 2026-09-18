"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Settings } from "lucide-react";
import Icon from "@/components/ui/Icon";

const TABS = [
  { href: "/dashboard", label: "Capsules", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-t border-line bg-white">
      {TABS.map(({ href, label, icon: Glyph }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold ${
              active ? "text-sky-deep" : "text-ink-soft"
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
