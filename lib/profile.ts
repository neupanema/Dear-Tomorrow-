import type { SupabaseClient } from "@supabase/supabase-js";

// Public bucket (see supabase/schema.sql) — a profile picture, shown on
// every screen, isn't worth the extra round trip a signed URL needs. Storage
// policies still only let a user write inside their own folder.
export const AVATAR_BUCKET = "avatars";

/** Only the lead times the notifications settings UI offers (see profiles_reminder_lead_hours_valid). */
export const REMINDER_LEAD_HOURS = [1, 24, 72, 168] as const;
export type ReminderLeadHours = (typeof REMINDER_LEAD_HOURS)[number];

export interface Profile {
  avatarPath: string | null;
  /** Epoch ms of the last change — append as a query string to bust the CDN cache. */
  updatedAt: number;
  emailRemindersEnabled: boolean;
  reminderLeadHours: ReminderLeadHours;
}

/** null if the user has never set one up (no row yet, which is normal — not an error). */
export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_path, updated_at, email_reminders_enabled, reminder_lead_hours")
    .eq("id", userId)
    .maybeSingle();
  // A real error (missing table, RLS reject, ...) is not the same as "no row
  // yet" — surface it instead of quietly showing no picture, which is what
  // made a previously-broken profiles table look like "the upload didn't work".
  if (error) throw error;
  if (!data) return null;
  return {
    avatarPath: data.avatar_path,
    updatedAt: new Date(data.updated_at).getTime(),
    emailRemindersEnabled: data.email_reminders_enabled,
    reminderLeadHours: data.reminder_lead_hours,
  };
}

/** Upserts notification preferences — same shape as uploadAvatar's profile write. */
export async function updateNotificationPrefs(
  supabase: SupabaseClient,
  userId: string,
  prefs: { emailRemindersEnabled: boolean; reminderLeadHours: ReminderLeadHours }
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    email_reminders_enabled: prefs.emailRemindersEnabled,
    reminder_lead_hours: prefs.reminderLeadHours,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
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
  // The upload can succeed while this fails (bad RLS, stale schema cache, ...)
  // — if it's not checked, the photo sits in storage with nothing pointing at
  // it, and the caller has no idea anything went wrong.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, avatar_path: path, updated_at: new Date().toISOString() });
  if (profileError) throw profileError;
  return path;
}

export async function removeAvatar(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([`${userId}/avatar`]);
  if (error) throw error;
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, avatar_path: null, updated_at: new Date().toISOString() });
  if (profileError) throw profileError;
}

export function avatarUrl(supabase: SupabaseClient, profile: Profile): string | null {
  if (!profile.avatarPath) return null;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(profile.avatarPath);
  return `${data.publicUrl}?v=${profile.updatedAt}`;
}
