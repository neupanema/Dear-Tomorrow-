"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User } from "lucide-react";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import Icon from "@/components/ui/Icon";
import PasswordField from "@/components/ui/PasswordField";
import { useToast } from "@/components/ui/Toast";
import { isValidEmail } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);

  const allFilled =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    password !== "" &&
    confirmPassword !== "";
  const canSubmit = allFilled && isValidEmail(email);
  const passwordsMismatch = confirmPassword !== "" && password !== confirmPassword;

  async function createAccount() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
      },
    });

    if (error) {
      toast(error.message, { variant: "error" });
      setPending(false);
      return;
    }

    toast("Account created");
    router.push("/dashboard");
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirmTouched(true);
    if (!canSubmit || password !== confirmPassword) return;
    createAccount();
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop-only left half, mirrors the sign-in / onboarding screens so
          the brand stays consistent across the auth flow. */}
      <aside className="hidden lg:flex lg:w-1/2 bg-hero flex-col items-center justify-center text-white text-center px-16">
        <div className="mb-6">
          <BrandMark size="lg" tone="light" />
        </div>
        <p className="font-display text-display mb-3">Hello, future you</p>
        <p className="text-lead max-w-xs">
          Create an account to start leaving messages for who you&apos;ll become.
        </p>
      </aside>

      <main className="min-h-screen lg:min-h-0 lg:w-1/2 bg-surface flex flex-col justify-center px-6 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="font-display text-heading lg:text-title text-ink mb-1">
            Create your account
          </h1>
          <p className="text-body text-ink-soft mb-6">
            So your capsules find their way back to you.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <fieldset disabled={pending} className="contents">
              <div className="relative">
                <Icon as={User} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
                <label htmlFor="firstName" className="sr-only">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  type="text"
                  placeholder="First name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-cream border-2 border-line rounded-xl pl-9 pr-3 py-3 text-lead text-ink focus:border-accent"
                />
              </div>

              <div className="relative">
                <Icon as={User} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
                <label htmlFor="lastName" className="sr-only">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  type="text"
                  placeholder="Last name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-cream border-2 border-line rounded-xl pl-9 pr-3 py-3 text-lead text-ink focus:border-accent"
                />
              </div>

              <div className="relative">
                <Icon as={Mail} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  placeholder="Email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream border-2 border-line rounded-xl pl-9 pr-3 py-3 text-lead text-ink focus:border-accent"
                />
              </div>

              <PasswordField
                id="password"
                name="password"
                label="Password"
                placeholder="Password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm password"
                placeholder="Confirm password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setConfirmTouched(true)}
                error={confirmTouched && passwordsMismatch ? "Passwords don't match." : undefined}
              />

              <div className="mt-2">
                <Button type="submit" loading={pending} disabled={pending || !canSubmit}>
                  {pending ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </fieldset>
          </form>

          <p className="text-center text-body text-ink-soft mt-6">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-accent font-bold underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
