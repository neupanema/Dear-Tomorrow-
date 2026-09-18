"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import CapsuleCard from "@/components/capsules/CapsuleCard";
import FabButton from "@/components/capsules/FabButton";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Icon from "@/components/ui/Icon";
import EmptyState from "@/components/ui/EmptyState";
import { EmptyCapsulesIllustration } from "@/components/ui/EmptyIllustrations";
import { MOCK_CAPSULES } from "@/lib/mock-data";
import { Lock, Plus, Sparkles } from "lucide-react";

type Filter = "all" | "sealed" | "unlocked";

export default function DashboardPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const sealedCount = MOCK_CAPSULES.filter((c) => c.status === "sealed").length;
  const unlockedCount = MOCK_CAPSULES.filter(
    (c) => c.status === "unlocked"
  ).length;

  const hasCapsules = MOCK_CAPSULES.length > 0;

  const visibleCapsules = useMemo(() => {
    if (filter === "all") return MOCK_CAPSULES;
    return MOCK_CAPSULES.filter((c) => c.status === filter);
  }, [filter]);

  return (
    <AppShell>
      <TopBar
        title="Your capsules"
        subtitle={
          hasCapsules
            ? `${sealedCount} sealed, ${unlockedCount} ready to open`
            : "Nothing sealed yet"
        }
      />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        {hasCapsules && (
          <div className="flex items-center justify-between mb-3 lg:mb-6">
            <div className="flex gap-2">
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
              <Button href="/new-capsule" className="!w-auto !inline-flex items-center gap-2 !py-3 !px-4">
                <Icon as={Plus} size="sm" />
                New capsule
              </Button>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
          <AnimatePresence mode="popLayout" initial>
            {visibleCapsules.map((capsule, i) => (
              <CapsuleCard key={capsule.id} capsule={capsule} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {!hasCapsules && (
          <EmptyState
            className="mt-10 lg:mt-24"
            illustration={<EmptyCapsulesIllustration className="w-48 h-auto lg:w-56" />}
            title="Your first capsule awaits"
            body="Write a note to the person you'll become, seal it, and we'll hold onto it until the moment arrives."
            action={{ label: "Create a capsule", icon: Plus, href: "/new-capsule" }}
          />
        )}

        {hasCapsules && visibleCapsules.length === 0 && (
          <EmptyState
            className="mt-10"
            illustration={
              <span className="w-14 h-14 rounded-2xl bg-tint text-accent flex items-center justify-center">
                <Icon as={filter === "sealed" ? Lock : Sparkles} size="lg" />
              </span>
            }
            title={filter === "sealed" ? "No sealed capsules" : "Nothing opened yet"}
            body={
              filter === "sealed"
                ? "Everything you've written is ready to open."
                : "Capsules show up here once they unlock and you open them."
            }
            action={{ label: "Show all capsules", variant: "secondary", onClick: () => setFilter("all") }}
          />
        )}
      </div>

      {hasCapsules && (
        <div className="lg:hidden">
          <FabButton />
        </div>
      )}
    </AppShell>
  );
}
