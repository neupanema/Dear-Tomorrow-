"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Settings, Plus } from "lucide-react";
import BrandMark from "@/components/ui/BrandMark";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Your capsules", icon: Home },
  { href: "/map", label: "Map of memories", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-line bg-surface min-h-screen px-5 py-8">
      <div className="flex items-center gap-3 px-2 mb-10">
        <BrandMark />
        <span className="font-display text-heading text-ink">Dear Tomorrow</span>
      </div>

      <Link href="/new-capsule" className="btn-primary w-full flex items-center justify-center gap-2 mb-8">
        <Icon as={Plus} size="sm" />
        New capsule
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Glyph }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-body font-bold transition-colors ${
                active
                  ? "bg-tint text-accent"
                  : "text-ink-soft hover:bg-cream"
              }`}
            >
              <Icon as={Glyph} size="md" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 px-2 pt-6 border-t border-line">
        <Avatar email={email} size="sm" />
        <div>
          <p className="text-body font-bold text-ink truncate max-w-[120px]">
            {email ?? "Loading..."}
          </p>
        </div>
        <ThemeToggle className="ml-auto" />
      </div>
    </aside>
  );
}
