"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import CapsuleCard from "@/components/capsules/CapsuleCard";
import FabButton from "@/components/capsules/FabButton";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { MOCK_CAPSULES } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import Icon from "@/components/ui/Icon";

type Filter = "all" | "sealed" | "unlocked";

export default function DashboardPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const sealedCount = MOCK_CAPSULES.filter((c) => c.status === "sealed").length;
  const unlockedCount = MOCK_CAPSULES.filter(
    (c) => c.status === "unlocked"
  ).length;

  const visibleCapsules = useMemo(() => {
    if (filter === "all") return MOCK_CAPSULES;
    return MOCK_CAPSULES.filter((c) => c.status === filter);
  }, [filter]);

  return (
    <AppShell>
      <TopBar
        title="Your capsules"
        subtitle={`${sealedCount} sealed, ${unlockedCount} ready to open`}
      />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        <div className="flex items-center justify-between mb-3 lg:mb-6">
          <div className="flex gap-1.5">
            <Chip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
            <Chip
              label="Sealed"
              active={filter === "sealed"}
              onClick={() => setFilter("sealed")}
            />
            <Chip
              label="Opened"
              active={filter === "unlocked"}
              onClick={() => setFilter("unlocked")}
            />
          </div>

          {/* On desktop there's no floating FAB — the "new capsule" action
              lives in the sidebar, and again here for convenience. */}
          <div className="hidden lg:block">
            <Button href="/new-capsule" className="!w-auto !inline-flex items-center gap-1.5 !py-2.5 !px-4">
              <Icon as={Plus} size="sm" />
              New capsule
            </Button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
          <AnimatePresence mode="popLayout" initial>
            {visibleCapsules.map((capsule, i) => (
              <CapsuleCard key={capsule.id} capsule={capsule} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {visibleCapsules.length === 0 && (
          <p className="text-center text-xs text-ink-soft mt-10">
            Nothing here yet.
          </p>
        )}
      </div>

      <div className="lg:hidden">
        <FabButton />
      </div>
    </AppShell>
  );
}
