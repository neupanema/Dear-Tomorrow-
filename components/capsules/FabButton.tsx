import Link from "next/link";
import { Plus } from "lucide-react";

export default function FabButton() {
  return (
    <Link
      href="/new-capsule"
      className="absolute bottom-20 right-4 w-14 h-14 rounded-full bg-coral text-white
                 flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(235,78,78,0.5)]"
      aria-label="Create a new capsule"
    >
      <Plus size={26} />
    </Link>
  );
}
