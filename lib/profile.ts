import type { SupabaseClient } from "@supabase/supabase-js";

// Public bucket (see supabase/schema.sql) — a profile picture, shown on
// every screen, isn't worth the extra round trip a signed URL needs. Storage
// policies still only let a user write inside their own folder.
export const AVATAR_BUCKET = "avatars";

export interface Profile {
  avatarPath: string | null;
  /** Epoch ms of the last change — append as a query string to bust the CDN cache. */
  updatedAt: number;
}

/** null if the user has never set one up (no row yet, which is normal). */
export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("avatar_path, updated_at")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return { avatarPath: data.avatar_path, updatedAt: new Date(data.updated_at).getTime() };
}

/** One object per user (upsert), so re-uploading replaces the old picture instead of piling up. */
export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const path = `${userId}/avatar`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  await supabase.from("profiles").upsert({ id: userId, avatar_path: path, updated_at: new Date().toISOString() });
  return path;
}

export async function removeAvatar(supabase: SupabaseClient, userId: string): Promise<void> {
  await supabase.storage.from(AVATAR_BUCKET).remove([`${userId}/avatar`]);
  await supabase
    .from("profiles")
    .upsert({ id: userId, avatar_path: null, updated_at: new Date().toISOString() });
}

export function avatarUrl(supabase: SupabaseClient, profile: Profile): string | null {
  if (!profile.avatarPath) return null;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(profile.avatarPath);
  return `${data.publicUrl}?v=${profile.updatedAt}`;
}
