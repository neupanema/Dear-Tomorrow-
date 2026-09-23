"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import Switch from "@/components/ui/Switch";
import Chip from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updateNotificationPrefs, REMINDER_LEAD_HOURS, type ReminderLeadHours } from "@/lib/profile";

const LEAD_LABELS: Record<ReminderLeadHours, string> = {
  1: "1 hour before",
  24: "1 day before",
  72: "3 days before",
  168: "1 week before",
};

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [leadHours, setLeadHours] = useState<ReminderLeadHours>(24);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
      try {
        const profile = await getProfile(supabase, data.user.id);
        if (profile) {
          setEnabled(profile.emailRemindersEnabled);
          setLeadHours(profile.reminderLeadHours);
        }
      } catch (err) {
        toast((err as Error).message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(next: { enabled: boolean; leadHours: ReminderLeadHours }) {
    if (!userId) return;
    try {
      await updateNotificationPrefs(createClient(), userId, {
        emailRemindersEnabled: next.enabled,
        reminderLeadHours: next.leadHours,
      });
    } catch (err) {
      toast((err as Error).message, { variant: "error" });
    }
  }

  function toggleEnabled(next: boolean) {
    setEnabled(next);
    void save({ enabled: next, leadHours });
  }

  function pickLeadHours(next: ReminderLeadHours) {
    setLeadHours(next);
    void save({ enabled, leadHours: next });
  }

  return (
    <AppShell>
      <TopBar title="Notifications" backHref="/settings" variant="plain" />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16 lg:max-w-lg">
        {!loading && (
          <>
            <div className="card mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-body text-ink">Email reminders</p>
                <p className="text-caption text-ink-soft mt-1">
                  Get an email when a capsule is about to unlock.
                </p>
              </div>
              <Switch checked={enabled} onChange={toggleEnabled} label="Email reminders" />
            </div>

            {enabled && (
              <div className="card">
                <p className="font-bold text-body text-ink mb-3">Remind me</p>
                <div className="flex gap-2 flex-wrap">
                  {REMINDER_LEAD_HOURS.map((hours) => (
                    <Chip
                      key={hours}
                      label={LEAD_LABELS[hours]}
                      active={leadHours === hours}
                      onClick={() => pickLeadHours(hours)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
