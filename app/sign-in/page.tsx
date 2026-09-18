"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SignInPage() {
  const router = useRouter();

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    // TODO: replace with a real auth call (Supabase Auth / NextAuth) once
    // the backend exists. For now this just moves the flow forward.
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop-only left half, mirrors the onboarding screen so the brand
          stays consistent across the sign-in step. */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky to-sky-deep flex-col items-center justify-center text-white text-center px-16">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6">
          <Bell size={28} className="text-sky-deep" />
        </div>
        <h2 className="font-display text-3xl mb-3">Welcome back</h2>
        <p className="text-sm opacity-90 leading-relaxed max-w-xs">
          Sign in to see what your past self left for you.
        </p>
      </div>

      <div className="min-h-screen lg:min-h-0 lg:w-1/2 bg-white flex flex-col justify-center px-6 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="font-display text-xl lg:text-2xl text-ink mb-1">
            Create your account
          </h1>
          <p className="text-xs lg:text-sm text-ink-soft mb-6">
            So your capsules find their way back to you.
          </p>

          <form onSubmit={handleContinue} className="flex flex-col gap-2.5">
            <input
              type="email"
              placeholder="Email address"
              required
              className="bg-cream border-2 border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-sky"
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="bg-cream border-2 border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-sky"
            />
            <div className="mt-2">
              <Button type="submit">Continue</Button>
            </div>
          </form>

          <div className="flex items-center gap-2 text-ink-soft text-[10px] my-4">
            <span className="flex-1 h-px bg-line" />
            or
            <span className="flex-1 h-px bg-line" />
          </div>

          <button className="w-full border-2 border-line rounded-xl py-2.5 text-xs font-bold text-ink">
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
