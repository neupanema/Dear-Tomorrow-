import { Resend } from "resend";

/**
 * Server-only email client — never import this from a "use client" file
 * (mirrors lib/supabase/admin.ts's service-role client, same reasoning:
 * whatever key it holds should never reach the browser).
 */
export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local (from your Resend dashboard's API Keys page), " +
        "then restart the dev server."
    );
  }
  return new Resend(apiKey);
}

/** The "from" address reminder emails are sent as — must be a verified sender/domain in Resend. */
export function getReminderFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not set. Add it to .env.local, then restart the dev server.");
  }
  return from;
}
