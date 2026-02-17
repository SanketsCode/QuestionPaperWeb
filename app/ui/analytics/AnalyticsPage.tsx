"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPerformanceAnalytics } from "../../lib/api";

type ActivityItem = { date: string; count: number };

function getMasteryAverage(mastery: any[]) {
  if (!mastery?.length) return 0;
  const total = mastery.reduce((acc, item) => acc + (item.percentage || 0), 0);
  return Math.round(total / mastery.length);
}

export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState("30 Days");

  const analyticsQuery = useQuery({
    queryKey: ["performance-analytics"],
    queryFn: getPerformanceAnalytics,
  });

  const counts = analyticsQuery.data?.counts || {
    realExams: 0,
    latestPapers: 0,
    customTests: 0,
    totalSolved: 0,
  };

  const mastery = analyticsQuery.data?.mastery || [];
  const totalMastery = getMasteryAverage(mastery);
  const activity: ActivityItem[] = analyticsQuery.data?.activity || [];

  const weeklyBars = useMemo(() => {
    const colors = ["#0f766e", "#2563eb", "#f59e0b", "#10b981", "#8b5cf6"];
    return activity.map((item, index) => ({
      ...item,
      height: Math.min(100, item.count * 20),
      color: colors[index % colors.length],
    }));
  }, [activity]);

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Analytics
          </p>
          <h1 className="mt-3 font-display text-3xl">
            Performance snapshot
          </h1>
        </header>

        <div className="flex flex-wrap gap-2 rounded-full border border-border bg-white/70 p-2">
          {["30 Days", "90 Days", "365 Days"].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                timeFilter === filter
                  ? "bg-brand text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {analyticsQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Loading analytics...
          </div>
        ) : analyticsQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Unable to load analytics.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">
                  Previous papers
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {counts.realExams}
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">
                  Latest papers
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {counts.latestPapers}
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">
                  Custom tests
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {counts.customTests}
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">
                  Total solved
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {counts.totalSolved}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-sm font-semibold">Subject mastery</div>
                <div className="mt-6 flex items-center justify-center">
                  <div
                    className="flex h-40 w-40 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#0f766e ${totalMastery}%, #e5e7eb 0)`,
                    }}
                  >
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-2xl font-semibold">
                      {totalMastery}%
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2 text-xs text-muted">
                  {mastery.length ? (
                    mastery.map((item: any) => (
                      <div
                        key={item.subject}
                        className="flex items-center justify-between"
                      >
                        <span>{item.subject}</span>
                        <span className="font-semibold text-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center">No mastery data yet.</div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-sm font-semibold">Weekly activity</div>
                <div className="mt-4 text-xs text-muted">
                  Tests completed
                </div>
                <div className="mt-6 flex items-end gap-3">
                  {weeklyBars.length ? (
                    weeklyBars.map(bar => (
                      <div
                        key={bar.date}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-full"
                          style={{
                            height: `${Math.max(10, bar.height)}px`,
                            backgroundColor: bar.color,
                          }}
                        />
                        <div className="text-[10px] text-muted">
                          {new Date(bar.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted">
                      No activity recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white/70 p-6 text-sm text-muted">
              Pro tip: solve a paper every day to keep your streak active.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
