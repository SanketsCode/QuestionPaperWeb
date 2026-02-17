"use client";

import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  backHref,
  backLabel = "Back",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="rounded-[32px] border border-border bg-card p-8 shadow-[0_25px_60px_rgba(15,118,110,0.12)] md:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-display text-lg">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
                QP
              </span>
              QuestionPaper
            </div>
            {backHref ? (
              <Link className="text-sm text-muted hover:text-foreground" href={backHref}>
                {backLabel}
              </Link>
            ) : null}
          </div>

          <div className="mt-10">
            <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
            <p className="mt-3 text-sm text-muted">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>
        </div>

        <div className="rounded-[32px] border border-border bg-white/70 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Trusted by learners
          </p>
          <h2 className="mt-4 font-display text-3xl">
            Practice, analyze, and compete — all in one place.
          </h2>
          <p className="mt-4 text-sm text-muted">
            Sync across devices, access verified question banks, and keep your
            progress organized with personalized analytics.
          </p>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm font-semibold">Daily practice</div>
              <div className="mt-2 text-xs text-muted">
                Custom sets + timed papers with instant review.
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm font-semibold">Live competitions</div>
              <div className="mt-2 text-xs text-muted">
                Track live status and leaderboard-ready submissions.
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm font-semibold">Performance insights</div>
              <div className="mt-2 text-xs text-muted">
                Focused analytics that guide your next move.
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-gradient-to-r from-brand/10 to-accent/20 p-4 text-sm text-muted">
            Use your mobile number to get a secure OTP. No passwords needed.
          </div>
        </div>
      </div>
    </div>
  );
}
