"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Capsule } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import CoverArt from "@/components/capsules/CoverArt";
import Icon from "@/components/ui/Icon";

interface CapsuleTimelineProps {
  capsules: Capsule[];
}

interface Group {
  key: string;
  label: string;
  items: Capsule[];
}

/** The date a capsule appears under: when it unlocks if known, otherwise when it was sealed. */
function timelineDate(capsule: Capsule): string {
  return capsule.unlockDate ?? capsule.createdAt;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Groups capsules by month (of their unlock date, falling back to when sealed), newest first. */
export default function CapsuleTimeline({ capsules }: CapsuleTimelineProps) {
  const sorted = [...capsules].sort(
    (a, b) => new Date(timelineDate(b)).getTime() - new Date(timelineDate(a)).getTime()
  );

  const groups: Group[] = [];
  for (const capsule of sorted) {
    const iso = timelineDate(capsule);
    const key = monthKey(iso);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: monthLabel(iso), items: [] };
      groups.push(group);
    }
    group.items.push(capsule);
  }

  return (
    <div className="relative pl-6">
      <div aria-hidden="true" className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-line" />
      {groups.map((group) => (
        <div key={group.key} className="mb-6 last:mb-0">
          <p className="text-caption font-bold text-ink-soft uppercase tracking-wide mb-3">{group.label}</p>
          <div className="flex flex-col gap-3">
            {group.items.map((capsule, i) => (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent border-2 border-surface"
                />
                <Link
                  href={`/capsule/${capsule.id}`}
                  className="card flex items-center gap-3 hover:border-accent transition-colors"
                >
                  {capsule.status === "sealed" ? (
                    <CoverArt capsuleId={capsule.id} mood={capsule.mood} size={36} />
                  ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 bg-coral">
                      <Icon as={Sparkles} size="sm" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-body text-ink truncate">{capsule.title}</p>
                    <p className="text-caption text-ink-soft truncate">{formatDate(timelineDate(capsule))}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
