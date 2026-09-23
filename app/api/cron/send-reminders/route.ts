import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/resend";
import { findDueReminders, sendReminderEmail } from "@/lib/reminders";

// GET route handlers are dynamic-by-default in this Next version, but this
// endpoint is hit by an external scheduler rather than a browser, so make
// that explicit rather than relying on the default.
export const dynamic = "force-dynamic";

/**
 * Hit on a schedule (see vercel.json) by an external cron, never by a signed-in
 * user — authenticated with a shared secret instead of a session cookie, the
 * same "verify, then use the privileged client" shape as app/api/account/route.ts.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const due = await findDueReminders(admin);

  let sent = 0;
  let failed = 0;
  for (const reminder of due) {
    try {
      await sendReminderEmail(getResendClient(), reminder.ownerEmail, reminder);
      // Race guard, same shape as the conditional update in checkLocationCapsules.ts.
      const { error } = await admin
        .from("capsules")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", reminder.capsuleId)
        .is("reminder_sent_at", null);
      if (error) throw error;
      sent++;
    } catch (err) {
      console.error("Reminder failed for capsule", reminder.capsuleId, err);
      failed++;
    }
  }

  return NextResponse.json({ checked: due.length, sent, failed });
}
