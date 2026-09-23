import type { SupabaseClient } from "@supabase/supabase-js";

export interface CapsuleOpen {
  email: string;
  openedAt: string;
}

interface CapsuleOpenRow {
  opened_by_email: string;
  opened_at: string;
}

/** Owner-facing open history for a capsule, oldest first. */
export async function listOpens(supabase: SupabaseClient, capsuleId: string): Promise<CapsuleOpen[]> {
  const { data, error } = await supabase
    .from("capsule_opens")
    .select("opened_by_email, opened_at")
    .eq("capsule_id", capsuleId)
    .order("opened_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as CapsuleOpenRow[]).map((row) => ({
    email: row.opened_by_email,
    openedAt: row.opened_at,
  }));
}
