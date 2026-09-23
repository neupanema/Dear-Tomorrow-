import type { SupabaseClient } from "@supabase/supabase-js";
import { isValidEmail } from "@/lib/utils";
import type { Capsule } from "@/lib/types";

export type CapsuleShareStatus = "pending" | "accepted" | "revoked";

export interface CapsuleShare {
  id: string;
  capsuleId: string;
  ownerId: string;
  invitedEmail: string;
  capsuleTitle: string;
  status: CapsuleShareStatus;
  createdAt: string;
  acceptedAt?: string;
}

interface CapsuleShareRow {
  id: string;
  capsule_id: string;
  owner_id: string;
  invited_email: string;
  capsule_title: string;
  status: CapsuleShareStatus;
  created_at: string;
  accepted_at: string | null;
}

function toShare(row: CapsuleShareRow): CapsuleShare {
  return {
    id: row.id,
    capsuleId: row.capsule_id,
    ownerId: row.owner_id,
    invitedEmail: row.invited_email,
    capsuleTitle: row.capsule_title,
    status: row.status,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at ?? undefined,
  };
}

/** Invites an email to view this capsule once they sign in with that address. Owner-only. */
export async function inviteToCapsule(supabase: SupabaseClient, capsule: Capsule, email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  if (!isValidEmail(trimmed)) throw new Error("Enter a valid email address.");

  const { error } = await supabase.from("capsule_shares").insert({
    capsule_id: capsule.id,
    owner_id: capsule.userId,
    invited_email: trimmed,
    capsule_title: capsule.title,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Already invited that email.");
    throw error;
  }
}

/** Owner-facing list of everyone a capsule has been shared with, newest first. */
export async function listSharesForCapsule(supabase: SupabaseClient, capsuleId: string): Promise<CapsuleShare[]> {
  const { data, error } = await supabase
    .from("capsule_shares")
    .select("*")
    .eq("capsule_id", capsuleId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as CapsuleShareRow[]).map(toShare);
}

/** Owner-only: revokes an invite (accepted or not) — the recipient loses access immediately. */
export async function revokeShare(supabase: SupabaseClient, shareId: string): Promise<void> {
  const { error } = await supabase.from("capsule_shares").update({ status: "revoked" }).eq("id", shareId);
  if (error) throw error;
}

/** Pending invites addressed to the signed-in user's own email — RLS already scopes this. */
export async function listMyInvites(supabase: SupabaseClient): Promise<CapsuleShare[]> {
  const { data, error } = await supabase
    .from("capsule_shares")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as CapsuleShareRow[]).map(toShare);
}

/** Accepts an invite addressed to the signed-in user, granting them read access to the capsule. */
export async function acceptInvite(supabase: SupabaseClient, shareId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("capsule_shares")
    .update({ status: "accepted", invited_user_id: userId, accepted_at: new Date().toISOString() })
    .eq("id", shareId);
  if (error) throw error;
}
