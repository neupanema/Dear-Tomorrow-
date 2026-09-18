"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Map, Settings, Plus } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Your capsules", icon: Home },
  { href: "/map", label: "Map of memories", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-line bg-white min-h-screen px-5 py-8">
      <div className="flex items-center gap-2.5 px-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-sky-deep text-white flex items-center justify-center">
          <Bell size={16} />
        </div>
        <span className="font-display text-lg text-ink">Dear Tomorrow</span>
      </div>

      <Link href="/new-capsule" className="btn-primary w-full flex items-center justify-center gap-2 mb-8">
        <Plus size={16} />
        New capsule
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                active
                  ? "bg-[#EAF6FF] text-sky-deep"
                  : "text-ink-soft hover:bg-cream"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 px-2 pt-6 border-t border-line">
        <div className="w-8 h-8 rounded-full bg-sky-deep text-white flex items-center justify-center font-display text-xs">
          M
        </div>
        <div>
          <p className="text-xs font-bold text-ink">Mahesh</p>
          <p className="text-[10px] text-ink-soft">mahesh@ulm.edu</p>
        </div>
      </div>
    </aside>
  );
}
