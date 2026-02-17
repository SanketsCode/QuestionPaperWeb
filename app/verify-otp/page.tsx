"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "../lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "../ui/auth/AuthShell";
import { useLanguage } from "../ui/LanguageContext";

const OTP_LENGTH = 6;

import { Suspense } from "react";

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = params.get("mobile") ?? "";
  const next = params.get("next") || "/home";
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (!mobile) {
      router.replace("/login");
    }
  }, [mobile, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const otpValue = useMemo(() => otp.join(""), [otp]);

  const verifyMutation = useMutation({
    mutationFn: ({ mobile_no, code }: { mobile_no: string; code: string }) =>
      verifyOtp(mobile_no, code),
    onSuccess: data => {
      if (typeof window !== "undefined") {
        localStorage.setItem("qp_access_token", data.accessToken);
        localStorage.setItem("qp_user", JSON.stringify(data.user));
      }
      router.push(next);
    },
    onError: () => {
      setError("Invalid OTP. Please try again.");
    },
  });

  const resendMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      setTimer(30);
    },
    onError: () => {
      setError("Unable to resend OTP.");
    },
  });

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setError("");
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (otpValue.length !== OTP_LENGTH) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    verifyMutation.mutate({ mobile_no: mobile, code: otpValue });
  };

  const handleResend = () => {
    if (!mobile || timer > 0) return;
    setError("");
    resendMutation.mutate(mobile);
  };

  return (
    <AuthShell
      title={t("auth.verifyTitle")}
      subtitle={t("auth.verifySubtitle")}
      backHref="/login"
      backLabel={t("auth.changeNumber")}
    >
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="text-sm text-muted">
          {t("auth.otpSentTo")} <span className="font-semibold text-foreground">+91 {mobile}</span>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {otp.map((value, index) => (
            <input
              key={index}
              ref={element => {
                inputsRef.current[index] = element;
              }}
              value={value}
              onChange={event => handleChange(event.target.value, index)}
              onKeyDown={event => handleKeyDown(event, index)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-2xl border border-border bg-white/80 text-center text-lg font-semibold text-foreground outline-none focus:border-brand"
            />
          ))}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || resendMutation.isPending}
            className="font-semibold text-brand disabled:text-muted"
          >
            {t("auth.resend")}
          </button>
          <div className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-brand-dark">
            00:{timer.toString().padStart(2, "0")}
          </div>
        </div>

        <button
          type="submit"
          disabled={verifyMutation.isPending}
          className="flex w-full items-center justify-center rounded-2xl bg-brand px-4 py-4 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(15,118,110,0.35)] disabled:opacity-70"
        >
          {verifyMutation.isPending ? t("auth.verifying") : t("auth.verifyBtn")}
        </button>
      </form>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
