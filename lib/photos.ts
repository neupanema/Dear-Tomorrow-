import type { SupabaseClient } from "@supabase/supabase-js";

// Private bucket (see supabase/schema.sql). Files live at
// <user id>/<capsule id>.<ext>, and storage policies only let a user touch
// the folder named after their own id.
export const PHOTO_BUCKET = "capsule-photos";
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

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

/** Uploads the photo and returns its storage path (what goes in capsules.photo_path). */
export async function uploadCapsulePhoto(
  supabase: SupabaseClient,
  userId: string,
  capsuleId: string,
  file: File
): Promise<string> {
  const path = `${userId}/${capsuleId}.${EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

/** Best-effort cleanup, e.g. when the capsule row failed to save after the upload. */
export async function removeCapsulePhoto(supabase: SupabaseClient, path: string): Promise<void> {
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}

/** A temporary link (the bucket is private). Null if it couldn't be created. */
export async function getCapsulePhotoUrl(
  supabase: SupabaseClient,
  path: string
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}
