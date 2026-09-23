"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/ui/PasswordField";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/utils";

export default function AccountSettingsPage() {
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const meta = data.user?.user_metadata as { first_name?: string; last_name?: string } | undefined;
        setFirstName(meta?.first_name ?? "");
        setLastName(meta?.last_name ?? "");
        setEmail(data.user?.email ?? "");
        setOriginalEmail(data.user?.email ?? "");
      });
  }, []);

  async function saveName() {
    if (savingName || !firstName.trim() || !lastName.trim()) return;
    setSavingName(true);
    const { error } = await createClient().auth.updateUser({
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
    });
    setSavingName(false);
    if (error) {
      toast(error.message, { variant: "error" });
      return;
    }
    toast("Name updated");
  }

  async function saveEmail() {
    if (savingEmail || !isValidEmail(email) || email === originalEmail) return;
    setSavingEmail(true);
    const { error } = await createClient().auth.updateUser({ email });
    setSavingEmail(false);
    if (error) {
      toast(error.message, { variant: "error" });
      return;
    }
    toast("Check your new email to confirm the change", { variant: "info" });
  }

  const passwordsMismatch = confirmPassword !== "" && password !== confirmPassword;
  const canSavePassword = password.length >= 6 && password === confirmPassword;

  async function savePassword() {
    setConfirmTouched(true);
    if (savingPassword || !canSavePassword) return;
    setSavingPassword(true);
    const { error } = await createClient().auth.updateUser({ password });
    setSavingPassword(false);
    if (error) {
      toast(error.message, { variant: "error" });
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setConfirmTouched(false);
    toast("Password updated");
  }

  return (
    <AppShell>
      <TopBar title="Account" backHref="/settings" variant="plain" />

      <div className="flex-1 p-4 pb-24 lg:px-10 lg:py-8 lg:pb-16 lg:max-w-lg">
        <div className="card mb-4">
          <p className="font-bold text-body text-ink mb-3">Name</p>
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className="sr-only">First name</label>
            <input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full bg-surface border-2 border-line-strong rounded-xl px-3 py-2.5 text-body text-ink focus:border-accent"
            />
            <label htmlFor="lastName" className="sr-only">Last name</label>
            <input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full bg-surface border-2 border-line-strong rounded-xl px-3 py-2.5 text-body text-ink focus:border-accent"
            />
          </div>
          <div className="mt-3">
            <Button
              onClick={saveName}
              loading={savingName}
              disabled={savingName || !firstName.trim() || !lastName.trim()}
            >
              Save name
            </Button>
          </div>
        </div>

        <div className="card mb-4">
          <p className="font-bold text-body text-ink mb-3">Email</p>
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full bg-surface border-2 border-line-strong rounded-xl px-3 py-2.5 text-body text-ink focus:border-accent"
          />
          <div className="mt-3">
            <Button
              onClick={saveEmail}
              loading={savingEmail}
              disabled={savingEmail || !isValidEmail(email) || email === originalEmail}
            >
              Save email
            </Button>
          </div>
        </div>

        <div className="card">
          <p className="font-bold text-body text-ink mb-3">Password</p>
          <div className="flex flex-col gap-3">
            <PasswordField
              id="newPassword"
              name="newPassword"
              label="New password"
              placeholder="New password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordField
              id="confirmNewPassword"
              name="confirmNewPassword"
              label="Confirm new password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmTouched(true)}
              error={confirmTouched && passwordsMismatch ? "Passwords don't match." : undefined}
            />
          </div>
          <div className="mt-3">
            <Button onClick={savePassword} loading={savingPassword} disabled={savingPassword || !canSavePassword}>
              Save password
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
