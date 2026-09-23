"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import CapsuleCard from "@/components/capsules/CapsuleCard";
import CapsuleTimeline from "@/components/capsules/CapsuleTimeline";
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
import { Clock, LayoutGrid, Lock, Plus, Search, Sparkles, X } from "lucide-react";

type Filter = "all" | "sealed" | "unlocked";
type Sort = "newest" | "oldest" | "unlock-soonest";
type View = "grid" | "timeline";

export default function DashboardPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[] | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [view, setView] = useState<View>("grid");

  const { coords } = useGeolocation();
  const locationChecked = useRef(false);

  const loadCapsules = useCallback(async (archived: boolean) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Capsules shared with this user (via an accepted invite) are visible to
    // RLS too, but they belong on /shared, not mixed into the owner's own list.
    let query = supabase.from("capsules").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    query = archived ? query.not("archived_at", "is", null) : query.is("archived_at", null);
    const { data, error } = await query;
    if (error) {
      toast(error.message, { variant: "error" });
      setCapsules((prev) => prev ?? []);
      return;
    }
    setCapsules(((data ?? []) as CapsuleRow[]).map(toCapsule));
  }, [toast]);

  useEffect(() => {
    setCapsules(null);
    void loadCapsules(showArchived);
  }, [loadCapsules, showArchived]);

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
        return loadCapsules(showArchived);
      })
      .catch(() => {
        // A failed background check shouldn't interrupt the dashboard; it
        // will simply run again on the next visit.
      });
  }, [coords, loadCapsules, showArchived, toast]);

  const loading = capsules === null;
  const allCapsules = capsules ?? [];

  const sealedCount = allCapsules.filter((c) => c.status === "sealed").length;
  const unlockedCount = allCapsules.filter(
    (c) => c.status === "unlocked"
  ).length;

  const hasCapsules = allCapsules.length > 0;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of allCapsules) for (const t of c.tags) set.add(t);
    return [...set].sort();
  }, [allCapsules]);

  const hasActiveSearchOrTags = search.trim().length > 0 || activeTags.length > 0;

  const visibleCapsules = useMemo(() => {
    // The status filter chips are hidden while viewing archived capsules —
    // every archived capsule is a candidate regardless of sealed/unlocked status.
    let list = showArchived || filter === "all" ? allCapsules : allCapsules.filter((c) => c.status === filter);

    if (activeTags.length > 0) {
      list = list.filter((c) => activeTags.every((tag) => c.tags.includes(tag)));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.message.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q))
      );
    }

    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // "Opens soonest" — capsules with no unlock date (place-only) sort last.
      sorted.sort((a, b) => {
        const aTime = a.unlockDate ? new Date(a.unlockDate).getTime() : Infinity;
        const bTime = b.unlockDate ? new Date(b.unlockDate).getTime() : Infinity;
        return aTime - bTime;
      });
    }
    return sorted;
  }, [filter, allCapsules, showArchived, activeTags, search, sort]);

  return (
    <AppShell>
      <TopBar
        title={showArchived ? "Archived capsules" : "Your capsules"}
        subtitle={
          loading
            ? "Loading..."
            : showArchived
            ? hasCapsules
              ? `${allCapsules.length} archived`
              : "No archived capsules"
            : hasCapsules
            ? `${sealedCount} sealed, ${unlockedCount} ready to open`
            : "Nothing sealed yet"
        }
      />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        <div className="flex justify-end mb-2 lg:mb-4">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-caption font-bold text-ink-soft underline"
          >
            {showArchived ? "Back to capsules" : "View archived"}
          </button>
        </div>

        {hasCapsules && !showArchived && (
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

        {hasCapsules && (
          <div className="mb-3 lg:mb-6">
            <div className="flex items-center gap-2 bg-surface border border-line rounded-xl px-3 mb-3 text-ink-soft">
              <Icon as={Search} size="sm" />
              <label htmlFor="capsule-search" className="sr-only">
                Search your capsules
              </label>
              <input
                id="capsule-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by message, title, or tag"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-body text-ink placeholder:text-ink-soft"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                  <Icon as={X} size="sm" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <div role="group" aria-label="Sort capsules" className="flex gap-2 flex-wrap">
                <Chip label="Newest" active={sort === "newest"} onClick={() => setSort("newest")} />
                <Chip label="Oldest" active={sort === "oldest"} onClick={() => setSort("oldest")} />
                <Chip
                  label="Opens soonest"
                  active={sort === "unlock-soonest"}
                  onClick={() => setSort("unlock-soonest")}
                />
              </div>
              <div role="group" aria-label="View" className="flex gap-1 bg-tint rounded-full p-1">
                <button
                  type="button"
                  aria-pressed={view === "grid"}
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-full ${view === "grid" ? "bg-surface text-accent" : "text-ink-soft"}`}
                >
                  <Icon as={LayoutGrid} size="sm" />
                </button>
                <button
                  type="button"
                  aria-pressed={view === "timeline"}
                  aria-label="Timeline view"
                  onClick={() => setView("timeline")}
                  className={`p-2 rounded-full ${view === "timeline" ? "bg-surface text-accent" : "text-ink-soft"}`}
                >
                  <Icon as={Clock} size="sm" />
                </button>
              </div>
            </div>

            {allTags.length > 0 && (
              <div role="group" aria-label="Filter by tag" className="flex gap-2 flex-wrap">
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    active={activeTags.includes(tag)}
                    onClick={() =>
                      setActiveTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === "timeline" ? (
          visibleCapsules.length > 0 && <CapsuleTimeline capsules={visibleCapsules} />
        ) : (
          <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
            <AnimatePresence mode="popLayout" initial>
              {visibleCapsules.map((capsule, i) => (
                <CapsuleCard key={capsule.id} capsule={capsule} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && !hasCapsules && !showArchived && (
          <EmptyState
            className="mt-10 lg:mt-24"
            illustration={<EmptyCapsulesIllustration className="w-48 h-auto lg:w-56" />}
            title="Your first capsule awaits"
            body="Write a note to the person you'll become, seal it, and we'll hold onto it until the moment arrives."
            action={{ label: "Create a capsule", icon: Plus, href: "/new-capsule" }}
          />
        )}

        {!loading && !hasCapsules && showArchived && (
          <EmptyState
            className="mt-10 lg:mt-24"
            illustration={
              <span className="w-14 h-14 rounded-2xl bg-tint text-accent flex items-center justify-center">
                <Icon as={Sparkles} size="lg" />
              </span>
            }
            title="Nothing archived"
            body="Capsules you archive show up here."
            action={{ label: "Back to capsules", variant: "secondary", onClick: () => setShowArchived(false) }}
          />
        )}

        {hasCapsules && visibleCapsules.length === 0 && hasActiveSearchOrTags && (
          <EmptyState
            className="mt-10"
            illustration={
              <span className="w-14 h-14 rounded-2xl bg-tint text-accent flex items-center justify-center">
                <Icon as={Search} size="lg" />
              </span>
            }
            title="No matches"
            body="Nothing matches your search and tag filters."
            action={{
              label: "Clear filters",
              variant: "secondary",
              onClick: () => {
                setSearch("");
                setActiveTags([]);
              },
            }}
          />
        )}

        {hasCapsules && visibleCapsules.length === 0 && !hasActiveSearchOrTags && (
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
