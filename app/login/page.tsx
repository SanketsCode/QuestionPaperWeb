"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "../lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "../ui/auth/AuthShell";
import { useEffect } from "react";

import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("qp_access_token");
    if (token) {
      router.replace(next || "/home");
    }
  }, [next, router]);

  const mutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      const nextParam = next ? `&next=${encodeURIComponent(next)}` : "";
      router.push(
        `/verify-otp?mobile=${encodeURIComponent(mobile)}${nextParam}`
      );
    },
    onError: () => {
      setError("Unable to send OTP. Please try again.");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const trimmed = mobile.replace(/\D/g, "");
    if (trimmed.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    mutation.mutate(trimmed);
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Login with your mobile number to continue your exam prep."
      backHref="/"
      backLabel="Home"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block text-sm font-semibold text-muted">
          Mobile number
          <div className="mt-2 flex overflow-hidden rounded-2xl border border-border bg-white/80">
            <div className="flex items-center justify-center border-r border-border px-4 text-sm font-semibold text-foreground">
              +91
            </div>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="00000 00000"
              value={mobile}
              onChange={event => setMobile(event.target.value)}
              className="w-full bg-transparent px-4 py-4 text-base text-foreground outline-none"
            />
          </div>
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center rounded-2xl bg-brand px-4 py-4 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(15,118,110,0.35)] disabled:opacity-70"
        >
          {mutation.isPending ? "Sending OTP..." : "Send OTP"}
        </button>

        <p className="text-xs text-muted">
          By continuing you agree to our terms of service and privacy policy.
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
