"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import Icon from "@/components/ui/Icon";
import PasswordField from "@/components/ui/PasswordField";
import { useToast } from "@/components/ui/Toast";
import { isValidEmail } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  // which button is mid-request, so only that one shows the spinner
  const [pending, setPending] = useState<"password" | "google" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = isValidEmail(email) && password.length > 0;

  async function signInWithPassword() {
    setPending("password");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast(error.message, { variant: "error" });
      setPending(null);
      return;
    }

    toast("Signed in");
    router.push("/dashboard");
    router.refresh();
  }

  function signInWithGoogle() {
    // Google is shown for now but not wired up yet.
    toast("Google sign-in is coming soon", { variant: "info" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    signInWithPassword();
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop-only left half, mirrors the onboarding screen so the brand
          stays consistent across the sign-in step. */}
      <aside className="hidden lg:flex lg:w-1/2 bg-hero flex-col items-center justify-center text-white text-center px-16">
        <div className="mb-6">
          <BrandMark size="lg" tone="light" />
        </div>
        <p className="font-display text-display mb-3">Welcome back</p>
        <p className="text-lead max-w-xs">
          Sign in to see what your past self left for you.
        </p>
      </aside>

      <main className="min-h-screen lg:min-h-0 lg:w-1/2 bg-surface flex flex-col justify-center px-6 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="font-display text-heading lg:text-title text-ink mb-1">
            Sign in
          </h1>
          <p className="text-body text-ink-soft mb-6">
            Enter your email and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <fieldset disabled={pending !== null} className="contents">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="mt-2">
                <Button type="submit" loading={pending === "password"} disabled={pending !== null || !canSubmit}>
                  {pending === "password" ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </fieldset>
          </form>

          <div className="flex items-center gap-2 text-ink-soft text-caption my-4">
            <span className="flex-1 h-px bg-line" />
            or
            <span className="flex-1 h-px bg-line" />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={signInWithGoogle}
            loading={pending === "google"}
            disabled={pending !== null}
            className="!text-ink"
          >
            {pending === "google" ? "Connecting..." : "Continue with Google"}
          </Button>

          <p className="text-center text-body text-ink-soft mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-accent font-bold underline underline-offset-4">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
