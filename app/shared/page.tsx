"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import CapsuleCard from "@/components/capsules/CapsuleCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { toCapsule, type CapsuleRow } from "@/lib/supabase/capsules";
import { acceptInvite, listMyInvites, type CapsuleShare } from "@/lib/supabase/shares";
import { Capsule } from "@/lib/types";
import { Gift, Mail } from "lucide-react";

export default function SharedPage() {
  const { toast } = useToast();
  const [invites, setInvites] = useState<CapsuleShare[] | null>(null);
  const [sharedCapsules, setSharedCapsules] = useState<Capsule[] | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [invitesResult, capsulesResult] = await Promise.all([
      listMyInvites(supabase).catch((err) => {
        toast((err as Error).message, { variant: "error" });
        return [] as CapsuleShare[];
      }),
      supabase
        .from("capsules")
        .select("*")
        .neq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setInvites(invitesResult);
    if (capsulesResult.error) {
      toast(capsulesResult.error.message, { variant: "error" });
      setSharedCapsules([]);
    } else {
      setSharedCapsules(((capsulesResult.data ?? []) as CapsuleRow[]).map(toCapsule));
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAccept(share: CapsuleShare) {
    if (acceptingId) return;
    setAcceptingId(share.id);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await acceptInvite(supabase, share.id, user.id);
      toast(`Accepted "${share.capsuleTitle}"`);
      await load();
    } catch (err) {
      toast((err as Error).message, { variant: "error" });
    } finally {
      setAcceptingId(null);
    }
  }

  const loading = invites === null || sharedCapsules === null;
  const hasInvites = (invites ?? []).length > 0;
  const hasShared = (sharedCapsules ?? []).length > 0;

  return (
    <AppShell>
      <TopBar
        title="Shared with you"
        subtitle={loading ? "Loading..." : hasShared ? `${sharedCapsules!.length} shared with you` : "Nothing yet"}
      />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        {hasInvites && (
          <div className="mb-6">
            <p className="text-caption font-bold text-ink-soft uppercase tracking-wide mb-3">
              Pending invites
            </p>
            <div className="flex flex-col gap-3">
              {invites!.map((share) => (
                <div key={share.id} className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-tint text-accent flex-shrink-0">
                    <Icon as={Mail} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-body text-ink truncate">{share.capsuleTitle}</p>
                    <p className="text-caption text-ink-soft">You've been invited</p>
                  </div>
                  <Button
                    onClick={() => handleAccept(share)}
                    loading={acceptingId === share.id}
                    disabled={acceptingId !== null}
                    className="!w-auto !py-2 !px-4"
                  >
                    Accept
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasShared && (
          <div>
            {hasInvites && (
              <p className="text-caption font-bold text-ink-soft uppercase tracking-wide mb-3">
                Shared with you
              </p>
            )}
            <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
              {sharedCapsules!.map((capsule, i) => (
                <CapsuleCard key={capsule.id} capsule={capsule} index={i} />
              ))}
            </div>
          </div>
        )}

        {!loading && !hasInvites && !hasShared && (
          <EmptyState
            className="mt-10 lg:mt-24"
            illustration={
              <span className="w-14 h-14 rounded-2xl bg-tint text-accent flex items-center justify-center">
                <Icon as={Gift} size="lg" />
              </span>
            }
            title="Nothing shared yet"
            body="When someone shares or gifts you a capsule, it'll show up here."
            action={{ label: "Back to your capsules", variant: "secondary", href: "/dashboard" }}
          />
        )}
      </div>
    </AppShell>
  );
}
