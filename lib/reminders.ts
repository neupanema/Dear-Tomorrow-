import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resend } from "resend";
import { getReminderFromAddress } from "@/lib/resend";
import { REMINDER_LEAD_HOURS, type ReminderLeadHours } from "@/lib/profile";

// Server-only module (needs the service-role client and the Resend API key)
// — never import this from a "use client" file, same rule as lib/supabase/admin.ts.
const MAX_LEAD_HOURS = Math.max(...REMINDER_LEAD_HOURS);

export interface DueReminder {
  capsuleId: string;
  title: string;
  unlockDate: string;
  ownerEmail: string;
}

interface DueCapsuleRow {
  id: string;
  title: string;
  unlock_date: string;
  user_id: string;
}

interface ProfilePrefsRow {
  id: string;
  email_reminders_enabled: boolean;
  reminder_lead_hours: ReminderLeadHours;
}

/**
 * Sealed date/date-and-place capsules unlocking soon that haven't had a
 * reminder sent yet, filtered down to owners whose notification preferences
 * say it's time. Uses the admin client — this runs with no user session, and
 * has to read across every user, which is exactly what the service-role
 * client (lib/supabase/admin.ts) is for.
 */
export async function findDueReminders(admin: SupabaseClient): Promise<DueReminder[]> {
  const horizon = new Date(Date.now() + MAX_LEAD_HOURS * 60 * 60 * 1000).toISOString();

  const { data: capsules, error: capsulesError } = await admin
    .from("capsules")
    .select("id, title, unlock_date, user_id")
    .eq("status", "sealed")
    .in("unlock_method", ["date", "date-and-place"])
    .is("reminder_sent_at", null)
    .not("unlock_date", "is", null)
    .lte("unlock_date", horizon);
  if (capsulesError) throw capsulesError;
  if (!capsules || capsules.length === 0) return [];

  const userIds = [...new Set((capsules as DueCapsuleRow[]).map((c) => c.user_id))];
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, email_reminders_enabled, reminder_lead_hours")
    .in("id", userIds);
  if (profilesError) throw profilesError;

  const prefsByUser = new Map<string, ProfilePrefsRow>((profiles as ProfilePrefsRow[]).map((p) => [p.id, p]));
  const now = Date.now();

  const due: DueReminder[] = [];
  for (const capsule of capsules as DueCapsuleRow[]) {
    // No row yet (never touched notification settings) defaults to the
    // column defaults: enabled, 24h lead — matches profiles_reminder_lead_hours_valid.
    const prefs = prefsByUser.get(capsule.user_id);
    const enabled = prefs?.email_reminders_enabled ?? true;
    if (!enabled) continue;

    const leadHours = prefs?.reminder_lead_hours ?? 24;
    const msUntilUnlock = new Date(capsule.unlock_date).getTime() - now;
    if (msUntilUnlock <= 0 || msUntilUnlock > leadHours * 60 * 60 * 1000) continue;

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(capsule.user_id);
    if (userError || !userData.user?.email) continue;

    due.push({
      capsuleId: capsule.id,
      title: capsule.title,
      unlockDate: capsule.unlock_date,
      ownerEmail: userData.user.email,
    });
  }
  return due;
}

export async function sendReminderEmail(resend: Resend, to: string, reminder: DueReminder): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await resend.emails.send({
    from: getReminderFromAddress(),
    to,
    subject: `Your capsule "${reminder.title}" opens soon`,
    html: `
      <p>Hi,</p>
      <p>Your capsule <strong>${escapeHtml(reminder.title)}</strong> is about to unlock.</p>
      <p><a href="${siteUrl}/capsule/${reminder.capsuleId}">Open it on Dear Tomorrow</a></p>
    `,
  });
  if (error) throw new Error(error.message);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
