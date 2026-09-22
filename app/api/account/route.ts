import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/lib/photos";
import { AVATAR_BUCKET } from "@/lib/profile";

/**
 * Permanently deletes the signed-in user's account: their photos, their
 * profile picture, and the auth user itself — which cascades (via the
 * `on delete cascade` foreign keys in supabase/schema.sql) to remove their
 * `capsules` and `profiles` rows automatically. Storage files don't follow
 * that cascade, so they're removed explicitly first.
 *
 * Deleting an auth user needs the service role key, which only ever runs
 * here on the server — never in the browser. Who gets deleted is always the
 * caller identified by their own session cookie, never a client-supplied id.
 */
export async function DELETE() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Not needed for a one-shot API call — the session isn't refreshed here.
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "You need to be signed in to do that." }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("Account deletion misconfigured:", err);
    return NextResponse.json(
      { error: "Account deletion isn't set up on the server yet. Try again later." },
      { status: 500 }
    );
  }

  // Best-effort storage cleanup. None of this blocks the account deletion
  // itself — an orphaned file is a much smaller problem than a user who
  // asked to be deleted and wasn't.
  await admin.storage.from(AVATAR_BUCKET).remove([`${user.id}/avatar`]);
  await removeAllUnderPrefix(admin, PHOTO_BUCKET, user.id);

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Account deletion failed:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Storage's `list()` is one directory level at a time, and capsule photos
 * are nested two deep (`<user id>/<capsule id>/<n>.<ext>`) — so list the
 * user's folder, then each capsule folder inside it, before removing
 * everything found by its full path.
 */
async function removeAllUnderPrefix(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  userPrefix: string
): Promise<void> {
  const { data: entries } = await admin.storage.from(bucket).list(userPrefix, { limit: 1000 });
  if (!entries || entries.length === 0) return;

  const paths: string[] = [];
  for (const entry of entries) {
    if (entry.id) {
      // A real file directly under the user's folder.
      paths.push(`${userPrefix}/${entry.name}`);
      continue;
    }
    // No id = a pseudo-folder (one per capsule) — list what's inside it.
    const subPrefix = `${userPrefix}/${entry.name}`;
    const { data: files } = await admin.storage.from(bucket).list(subPrefix, { limit: 1000 });
    for (const file of files ?? []) paths.push(`${subPrefix}/${file.name}`);
  }

  if (paths.length > 0) await admin.storage.from(bucket).remove(paths);
}
