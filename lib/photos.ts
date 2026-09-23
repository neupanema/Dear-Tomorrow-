import type { SupabaseClient } from "@supabase/supabase-js";

// Private bucket (see supabase/schema.sql). Files live at
// <user id>/<capsule id>/<index>.<ext>, and storage policies only let a user
// touch the folder named after their own id.
export const PHOTO_BUCKET = "capsule-photos";
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** How many photos a capsule can carry before the app asks for a subscription. */
export const FREE_PHOTO_LIMIT = 3;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

/** Returns a user-facing problem with the file, or null if it's fine to upload. */
export function validatePhoto(file: File): string | null {
  if (!(file.type in EXTENSIONS)) return "Please choose a JPG, PNG, WebP, GIF or HEIC photo.";
  if (file.size > MAX_PHOTO_BYTES) return "That photo is over 10 MB. Try a smaller one.";
  return null;
}

/** Uploads every photo and returns their storage paths, in order. */
export async function uploadCapsulePhotos(
  supabase: SupabaseClient,
  userId: string,
  capsuleId: string,
  files: File[]
): Promise<string[]> {
  const paths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `${userId}/${capsuleId}/${i}.${EXTENSIONS[file.type]}`;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (error) {
      // Best effort: don't leave the photos that did upload orphaned.
      if (paths.length > 0) await removeCapsulePhotos(supabase, paths);
      throw error;
    }
    paths.push(path);
  }
  return paths;
}

/**
 * Uploads a single photo appended during an edit. Named with a UUID (not a
 * position index) so it can never collide with the `0.jpg`/`1.jpg`/...
 * paths `uploadCapsulePhotos` gave the capsule's original photos.
 */
export async function uploadCapsulePhoto(
  supabase: SupabaseClient,
  userId: string,
  capsuleId: string,
  file: File
): Promise<string> {
  const path = `${userId}/${capsuleId}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

/** Best-effort cleanup, e.g. when the capsule row failed to save after the upload. */
export async function removeCapsulePhotos(supabase: SupabaseClient, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await supabase.storage.from(PHOTO_BUCKET).remove(paths);
}

/** Temporary links (the bucket is private), same order as `paths`. A failed one is left out. */
export async function getCapsulePhotoUrls(
  supabase: SupabaseClient,
  paths: string[]
): Promise<string[]> {
  const urls = await Promise.all(
    paths.map(async (path) => {
      const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 60 * 60);
      return error ? null : data.signedUrl;
    })
  );
  return urls.filter((url): url is string => url !== null);
}
