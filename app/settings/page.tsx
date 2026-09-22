"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Camera, Loader2, Lock, LogOut, MapPin, Moon, Settings as SettingsIcon, Trash2, Video, ChevronRight } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Avatar from "@/components/ui/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/useProfile";
import { removeAvatar, uploadAvatar } from "@/lib/profile";
import { validatePhoto } from "@/lib/photos";
import Icon from "@/components/ui/Icon";

const ITEMS = [
  { icon: Bell, label: "Notifications" },
  { icon: Lock, label: "Privacy & sealed capsules" },
  { icon: MapPin, label: "Location access" },
  { icon: Video, label: "Video messages", badge: "Soon" },
  { icon: SettingsIcon, label: "Account" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { avatarUrl, refresh: refreshProfile } = useProfile();
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  async function handleAvatarFile(file: File | null) {
    if (!file || !userId || savingAvatar) return;
    const problem = validatePhoto(file);
    if (problem) {
      toast(problem, { variant: "error" });
      return;
    }
    setSavingAvatar(true);
    try {
      await uploadAvatar(createClient(), userId, file);
      await refreshProfile();
      toast("Profile photo updated");
    } catch (err) {
      toast((err as Error).message, { variant: "error" });
    } finally {
      setSavingAvatar(false);
      if (avatarInput.current) avatarInput.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    if (!userId || savingAvatar) return;
    setSavingAvatar(true);
    try {
      await removeAvatar(createClient(), userId);
      await refreshProfile();
      toast("Profile photo removed", { variant: "info" });
    } catch (err) {
      toast((err as Error).message, { variant: "error" });
    } finally {
      setSavingAvatar(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong. Please try again.");

      // The account (and its session) is gone server-side; clear it locally too.
      await createClient().auth.signOut();
      router.push("/sign-in");
      router.refresh();
      toast("Your account has been deleted");
    } catch (err) {
      toast((err as Error).message, { variant: "error" });
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <TopBar title="Settings" variant="plain" />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start">
          <div className="card flex items-center gap-3 mb-4 lg:mb-0 lg:flex-col lg:text-center lg:py-8">
            <div className="relative">
              <Avatar email={email} size="lg" />
              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                disabled={savingAvatar}
                aria-label={avatarUrl ? "Change profile photo" : "Add profile photo"}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface border-2 border-cream text-accent flex items-center justify-center shadow-md disabled:opacity-60"
              >
                <Icon as={savingAvatar ? Loader2 : Camera} size="sm" className={savingAvatar ? "animate-spin" : undefined} />
              </button>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={(e) => handleAvatarFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <p className="font-bold text-lead text-ink lg:mt-3">
                {email ?? "Loading..."}
              </p>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={savingAvatar}
                  className="text-caption text-ink-soft underline mt-1 disabled:opacity-60"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-3">
            <div className="w-full bg-surface border border-line rounded-xl px-3 py-3 lg:py-4 mb-2 lg:mb-0 flex items-center gap-3 text-body text-ink">
              <span className="w-8 h-8 rounded-lg bg-tint text-accent flex items-center justify-center">
                <Icon as={Moon} size="sm" />
              </span>
              Dark mode
              <ThemeToggle className="ml-auto" />
            </div>
            {ITEMS.map(({ icon: Glyph, label, badge }) => (
              <button
                key={label}
                type="button"
                // TODO: each of these opens a real settings screen later
                onClick={() => toast("This setting isn't available yet", { variant: "info" })}
                className="w-full bg-surface border border-line rounded-xl px-3 py-3 lg:py-4 mb-2 lg:mb-0 flex items-center gap-3 text-body text-ink"
              >
                <span className="w-8 h-8 rounded-lg bg-tint text-accent flex items-center justify-center">
                  <Icon as={Glyph} size="sm" />
                </span>
                {label}
                {badge && (
                  <span className="text-micro font-bold bg-sun text-on-sun px-2 py-1 rounded-full">
                    {badge}
                  </span>
                )}
                <Icon as={ChevronRight} size="sm" className="ml-auto text-ink-soft" />
              </button>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="w-full bg-surface border border-line rounded-xl px-3 py-3 lg:py-4 mb-2 lg:mb-0 flex items-center gap-3 text-body text-coral font-bold"
            >
              <span className="w-8 h-8 rounded-lg bg-tint text-coral flex items-center justify-center">
                <Icon as={LogOut} size="sm" />
              </span>
              Sign out
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full px-3 py-3 lg:py-4 mb-2 lg:mb-0 lg:col-span-2 flex items-center justify-center gap-2 text-caption font-bold text-ink-soft"
            >
              <Icon as={Trash2} size="sm" />
              Delete account
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete your account?"
        body={
          <>
            This permanently deletes your account, every capsule you&apos;ve sealed or opened,
            and any photos attached to them. There&apos;s no undoing this.
          </>
        }
        confirmLabel="Delete my account"
        confirmWord="DELETE"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onClose={() => !deleting && setShowDeleteDialog(false)}
      />
    </AppShell>
  );
}
