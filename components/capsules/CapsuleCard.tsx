import Link from "next/link";
import { Lock, MapPin, Sparkles } from "lucide-react";
import { Capsule } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function badge(capsule: Capsule) {
  if (capsule.status === "unlocked") {
    return { icon: Sparkles, bg: "bg-coral" };
  }
  if (capsule.unlockMethod === "place") {
    return { icon: MapPin, bg: "bg-sun text-[#7a5300]" };
  }
  return { icon: Lock, bg: "bg-sky-deep" };
}

function subtitle(capsule: Capsule) {
  if (capsule.status === "unlocked") return "Ready to open now";
  if (capsule.unlockMethod === "place")
    return `Opens when I return to ${capsule.unlockLocation?.label ?? "this place"}`;
  if (capsule.unlockDate) return `Opens ${formatDate(capsule.unlockDate)}`;
  return "Sealed";
}

export default function CapsuleCard({ capsule }: { capsule: Capsule }) {
  const { icon: Icon, bg } = badge(capsule);

  return (
    <Link
      href={
        capsule.status === "unlocked"
          ? `/capsule/${capsule.id}`
          : `/capsule/${capsule.id}` // sealed capsules also route here and show the waiting screen
      }
      className="card flex items-center gap-3 mb-2.5 lg:mb-0 lg:p-4"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${bg}`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-xs text-ink truncate">{capsule.title}</p>
        <p className="text-[10px] text-ink-soft mt-0.5">{subtitle(capsule)}</p>
      </div>
      {capsule.status === "unlocked" && (
        <span className="text-[9px] font-bold text-sky-deep bg-[#EAF6FF] px-2 py-1 rounded-full">
          Open
        </span>
      )}
    </Link>
  );
}
