import { Bell, Lock, MapPin, Settings as SettingsIcon, Video, ChevronRight } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";

const ITEMS = [
  { icon: Bell, label: "Notifications" },
  { icon: Lock, label: "Privacy & sealed capsules" },
  { icon: MapPin, label: "Location access" },
  { icon: Video, label: "Video messages", badge: "Soon" },
  { icon: SettingsIcon, label: "Account" },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <TopBar title="Settings" variant="plain" />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start">
          <div className="card flex items-center gap-3 mb-4 lg:mb-0 lg:flex-col lg:text-center lg:py-8">
            <div className="w-11 h-11 lg:w-16 lg:h-16 rounded-full bg-sky-deep text-white flex items-center justify-center font-display text-base lg:text-xl">
              M
            </div>
            <div>
              <p className="font-bold text-sm text-ink lg:mt-3">Mahesh</p>
              <p className="text-[10.5px] text-ink-soft">mahesh@ulm.edu</p>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-3">
            {ITEMS.map(({ icon: Icon, label, badge }) => (
              <button
                key={label}
                className="w-full bg-white border border-line rounded-xl px-3 py-2.5 lg:py-4 mb-2 lg:mb-0 flex items-center gap-2.5 text-xs text-ink"
              >
                <span className="w-[26px] h-[26px] rounded-lg bg-[#EAF6FF] text-sky-deep flex items-center justify-center">
                  <Icon size={13} />
                </span>
                {label}
                {badge && (
                  <span className="text-[8px] font-extrabold bg-sun text-[#7a5300] px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
                <ChevronRight size={14} className="ml-auto text-ink-soft" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
