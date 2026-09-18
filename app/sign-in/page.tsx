"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { wait } from "@/lib/utils";

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  // which button is mid-request, so only that one shows the spinner
  const [pending, setPending] = useState<"password" | "google" | null>(null);

  async function signIn(method: "password" | "google") {
    setPending(method);
    // TODO: replace with a real auth call (Supabase Auth / NextAuth) once
    // the backend exists. The wait() only stands in for its latency.
    await wait(900);
    toast("Signed in");
    router.push("/dashboard");
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    signIn("password");
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop-only left half, mirrors the onboarding screen so the brand
          stays consistent across the sign-in step. */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-hero-top to-hero-bottom flex-col items-center justify-center text-white text-center px-16">
        <div className="mb-6">
          <BrandMark size="lg" tone="light" />
        </div>
        <p className="font-display text-display mb-3">Welcome back</p>
        <p className="text-lead opacity-90 max-w-xs">
          Sign in to see what your past self left for you.
        </p>
      </div>

      <main className="min-h-screen lg:min-h-0 lg:w-1/2 bg-surface flex flex-col justify-center px-6 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="font-display text-heading lg:text-title text-ink mb-1">
            Create your account
          </h1>
          <p className="text-body text-ink-soft mb-6">
            So your capsules find their way back to you.
          </p>

          <form onSubmit={handleContinue} className="flex flex-col gap-3">
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
                  className="w-full bg-cream border-2 border-line rounded-xl pl-9 pr-3 py-3 text-lead text-ink focus:border-accent"
                />
              </div>
              <div className="relative">
                <Icon as={Lock} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full bg-cream border-2 border-line rounded-xl pl-9 pr-3 py-3 text-lead text-ink focus:border-accent"
                />
              </div>
              <div className="mt-2">
                <Button type="submit" loading={pending === "password"} disabled={pending !== null}>
                  {pending === "password" ? "Signing in..." : "Continue"}
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
            onClick={() => signIn("google")}
            loading={pending === "google"}
            disabled={pending !== null}
            className="!text-ink"
          >
            {pending === "google" ? "Connecting..." : "Continue with Google"}
          </Button>
        </div>
      </main>
    </div>
  );
}
