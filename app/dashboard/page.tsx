"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { toCapsule, type CapsuleRow } from "@/lib/supabase/capsules";
import { checkLocationCapsules } from "@/lib/checkLocationCapsules";
import { useGeolocation } from "@/lib/useGeolocation";
import { Capsule } from "@/lib/types";
import { Lock, Plus, Sparkles } from "lucide-react";

type Filter = "all" | "sealed" | "unlocked";

export default function DashboardPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [capsules, setCapsules] = useState<Capsule[] | null>(null);

  const { coords } = useGeolocation();
  const locationChecked = useRef(false);

  const loadCapsules = useCallback(async () => {
    const { data, error } = await createClient()
      .from("capsules")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast(error.message, { variant: "error" });
      setCapsules((prev) => prev ?? []);
      return;
    }
    setCapsules(((data ?? []) as CapsuleRow[]).map(toCapsule));
  }, [toast]);

  useEffect(() => {
    void loadCapsules();
  }, [loadCapsules]);

  // Once the browser hands over a position, see whether we're standing at any
  // sealed place capsule. If location is denied or unsupported, `coords` just
  // stays null and this never runs — deliberately silent, since saying no to
  // location is a normal choice. Checked once per visit: the ref also keeps
  // React strict mode's double-invoked effect from running it twice.
  useEffect(() => {
    if (!coords || locationChecked.current) return;
    locationChecked.current = true;

    checkLocationCapsules(coords)
      .then((unlocked) => {
        if (unlocked.length === 0) return;
        if (unlocked.length <= 3) {
          unlocked.forEach((c) =>
            toast(`🎉 ${c.title} just unlocked!`, { duration: 6000 })
          );
        } else {
          toast(`🎉 ${unlocked.length} capsules just unlocked!`, { duration: 6000 });
        }
        return loadCapsules();
      })
      .catch(() => {
        // A failed background check shouldn't interrupt the dashboard; it
        // will simply run again on the next visit.
      });
  }, [coords, loadCapsules, toast]);

  const loading = capsules === null;
  const allCapsules = capsules ?? [];

  const sealedCount = allCapsules.filter((c) => c.status === "sealed").length;
  const unlockedCount = allCapsules.filter(
    (c) => c.status === "unlocked"
  ).length;

  const hasCapsules = allCapsules.length > 0;

  const visibleCapsules = useMemo(() => {
    if (filter === "all") return allCapsules;
    return allCapsules.filter((c) => c.status === filter);
  }, [filter, allCapsules]);

  return (
    <AppShell>
      <TopBar
        title="Your capsules"
        subtitle={
          loading
            ? "Loading your capsules..."
            : hasCapsules
            ? `${sealedCount} sealed, ${unlockedCount} ready to open`
            : "Nothing sealed yet"
        }
      />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        {hasCapsules && (
          <div className="flex items-center justify-between mb-3 lg:mb-6">
            <div role="group" aria-label="Filter capsules" className="flex gap-2">
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

        {!loading && !hasCapsules && (
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
