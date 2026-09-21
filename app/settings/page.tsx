"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Lock, LogOut, MapPin, Moon, Settings as SettingsIcon, Video, ChevronRight } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";

const ITEMS = [
  { icon: Bell, label: "Notifications" },
  { icon: Lock, label: "Privacy & sealed capsules" },
  { icon: MapPin, label: "Location access" },
  { icon: Video, label: "Video messages", badge: "Soon" },
  { icon: SettingsIcon, label: "Account" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <AppShell>
      <TopBar title="Settings" variant="plain" />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start">
          <div className="card flex items-center gap-3 mb-4 lg:mb-0 lg:flex-col lg:text-center lg:py-8">
            <div className="w-11 h-11 lg:w-16 lg:h-16 rounded-full bg-accent text-on-accent flex items-center justify-center font-display text-lead lg:text-heading">
              {email ? email[0].toUpperCase() : "?"}
            </div>
            <div>
              <p className="font-bold text-lead text-ink lg:mt-3">
                {email ?? "Loading..."}
              </p>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-3">
            <div className="w-full bg-surface border border-line rounded-xl px-3 py-3 lg:py-4 mb-2 lg:mb-0 flex items-center gap-3 text-body text-ink">
              <span className="w-8 h-8 rounded-lg bg-tint text-accent flex items-center justify-center">
                <Icon as={Moon} size="sm" />
              </span>
              Dark mode
              <ThemeToggle className="ml-auto" />
            </div>
            {ITEMS.map(({ icon: Glyph, label, badge }) => (
              <button
                key={label}
                type="button"
                // TODO: each of these opens a real settings screen later
                onClick={() => toast("This setting isn't available yet", { variant: "info" })}
                className="w-full bg-surface border border-line rounded-xl px-3 py-3 lg:py-4 mb-2 lg:mb-0 flex items-center gap-3 text-body text-ink"
              >
                <span className="w-8 h-8 rounded-lg bg-tint text-accent flex items-center justify-center">
                  <Icon as={Glyph} size="sm" />
                </span>
                {label}
                {badge && (
                  <span className="text-micro font-bold bg-sun text-on-sun px-2 py-1 rounded-full">
                    {badge}
                  </span>
                )}
                <Icon as={ChevronRight} size="sm" className="ml-auto text-ink-soft" />
              </button>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="w-full bg-surface border border-line rounded-xl px-3 py-3 lg:py-4 mb-2 lg:mb-0 flex items-center gap-3 text-body text-coral font-bold"
            >
              <span className="w-8 h-8 rounded-lg bg-tint text-coral flex items-center justify-center">
                <Icon as={LogOut} size="sm" />
              </span>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
