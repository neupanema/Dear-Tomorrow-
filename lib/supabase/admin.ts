import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Full-privilege client — bypasses row-level security entirely. The service
 * role key must never reach the browser, so only import this file from a
 * Route Handler (app/api/**\/route.ts) or other server-only code, never from
 * a "use client" component.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase dashboard -> " +
        "Project Settings -> API -> service_role secret), then restart the dev server."
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
