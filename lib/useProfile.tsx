"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { avatarUrl, getProfile } from "@/lib/profile";

interface ProfileContextValue {
  /** null once loaded with no picture set; undefined while loading. */
  avatarUrl: string | null | undefined;
  /**
   * Re-reads the profile row — call after uploading or removing a photo.
   * Throws on a real failure, so the caller (e.g. Settings) can show why the
   * change didn't take, rather than it failing invisibly.
   */
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

/**
 * Fetches the signed-in user's avatar once and shares it everywhere
 * (sidebar, settings, ...) so uploading a new one updates every avatar on
 * screen without each place re-fetching it separately.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUrl(null);
      return;
    }
    const profile = await getProfile(supabase, user.id);
    setUrl(profile ? avatarUrl(supabase, profile) : null);
  }, []);

  useEffect(() => {
    // Swallowed here (not in `refresh` itself): this first, automatic load
    // should degrade to the fallback initial quietly, but an explicit
    // refresh() call after an upload should still throw so that caller can
    // show what went wrong.
    void refresh().catch(() => {});
  }, [refresh]);

  const value = useMemo(() => ({ avatarUrl: url, refresh }), [url, refresh]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
