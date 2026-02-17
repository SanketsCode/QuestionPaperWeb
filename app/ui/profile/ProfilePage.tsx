"use client";

import { useEffect, useState } from "react";
import { getMyProfile } from "../../lib/api";

type StoredUser = {
  _id?: string;
  name?: string;
  contact?: string;
  email?: string;
  profile_pic?: string;
  planName?: string;
  subscriptionEndDate?: string;
  purchasedPackages?: {
    planId: string;
    planName: string;
    categoryName: string;
    endDate: string;
    status: string;
  }[];
};

export default function ProfilePage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("qp_user");
    if (raw) {
      setUser(JSON.parse(raw));
    }
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      setUser(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("qp_user", JSON.stringify(data));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("qp_access_token");
    localStorage.removeItem("qp_user");
    window.location.href = "/";
  };

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Profile
          </p>
          <h1 className="mt-3 font-display text-3xl">
            {user?.name || "Learner"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {user?.contact || user?.email || "No contact info"}
          </p>
        </header>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Subscription</div>
              <div className="mt-2 text-xs text-muted">
                {user?.planName || "Free plan"}
              </div>
              {user?.subscriptionEndDate ? (
                <div className="mt-1 text-xs text-muted">
                  Expires on{" "}
                  {new Date(user.subscriptionEndDate).toLocaleDateString()}
                </div>
              ) : null}
            </div>
            <a
              href="/subscription"
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
            >
              Manage plan
            </a>
          </div>
        </div>

        {user?.purchasedPackages?.length ? (
          <div className="rounded-3xl border border-border bg-white/70 p-6">
            <div className="text-sm font-semibold">Purchased packages</div>
            <div className="mt-4 grid gap-3">
              {user.purchasedPackages.map((pkg, index) => (
                <div
                  key={`${pkg.planId}-${index}`}
                  className="rounded-2xl border border-border bg-card p-4 text-xs"
                >
                  <div className="font-semibold">{pkg.planName}</div>
                  <div className="mt-1 text-muted">{pkg.categoryName}</div>
                  <div className="mt-1 text-muted">
                    Ends {new Date(pkg.endDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="/my-academy"
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="text-sm font-semibold">My Academy</div>
            <div className="mt-2 text-xs text-muted">
              Upcoming tests, notifications, and papers.
            </div>
          </a>
          <a
            href="/analytics"
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="text-sm font-semibold">Analytics</div>
            <div className="mt-2 text-xs text-muted">
              Track progress and mastery.
            </div>
          </a>
          <a
            href="/results"
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="text-sm font-semibold">Results</div>
            <div className="mt-2 text-xs text-muted">
              View recent test submissions.
            </div>
          </a>
          <a
            href="/competitions"
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="text-sm font-semibold">Competitions</div>
            <div className="mt-2 text-xs text-muted">
              Live, upcoming, and completed challenges.
            </div>
          </a>
          <a
            href="/notifications"
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="text-sm font-semibold">Notifications</div>
            <div className="mt-2 text-xs text-muted">All updates in one place.</div>
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
            onClick={refreshProfile}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh profile"}
          </button>
          <button
            className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
