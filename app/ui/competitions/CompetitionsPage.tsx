"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Competition,
  getCompetitions,
  getMyCompetitionSubmissions,
} from "../../lib/api";
import { useLanguage } from "../LanguageContext";

type Tab = "live" | "upcoming" | "completed" | "my_submissions";

const statusStyle: Record<string, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
};



function formatDateTime(dateTime?: string) {
  if (!dateTime) return "—";
  const date = new Date(dateTime);
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatus(competition: Competition): Tab {
  const status = (competition.status || "").toLowerCase();
  if (status === "live") return "live";
  if (status === "completed") return "completed";
  return "upcoming";
}

export default function CompetitionsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const competitionsQuery = useQuery({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
  });

  const submissionsQuery = useQuery({
    queryKey: ["my-competition-submissions"],
    queryFn: getMyCompetitionSubmissions,
    enabled: activeTab === "my_submissions",
  });

  const filtered = useMemo(() => {
    const list = competitionsQuery.data ?? [];
    return list.filter(item => getStatus(item) === activeTab);
  }, [competitionsQuery.data, activeTab]);

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {t("competitions.title")}
          </p>
          <h1 className="mt-3 font-display text-3xl">
            Challenge yourself in live exams
          </h1>
          <p className="mt-2 text-sm text-muted">
            Track live, upcoming, and completed challenges in one place.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 rounded-full border border-border bg-white/70 p-2">
          {(["live", "upcoming", "completed", "my_submissions"] as Tab[]).map(
            tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  activeTab === tab
                    ? "bg-brand text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab === "my_submissions" ? t("competitions.mySubmissions") : t(`competitions.${tab}`)}
              </button>
            )
          )}
        </div>

        {activeTab === "my_submissions" ? (
          submissionsQuery.isLoading ? (
            <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
              Loading submissions...
            </div>
          ) : !submissionsQuery.data?.length ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <div className="text-lg font-semibold">No submissions yet</div>
              <p className="mt-2 text-sm text-muted">
                Participate in a competition to see it here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(submissionsQuery.data || []).map(submission => (
                <div
                  key={submission._id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {submission.competition?.title || "Competition"}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        Submitted on {formatDateTime(submission.submittedAt)}
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${
                        submission.status === "submitted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-foreground">
                        {submission.score}
                      </span>{" "}
                      <span className="text-muted">{t("results.score")}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        {submission.correctCount}
                      </span>{" "}
                      <span className="text-muted">{t("results.correct")}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        {submission.wrongCount}
                      </span>{" "}
                      <span className="text-muted">{t("results.wrong")}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <a
                      className="text-sm font-semibold text-brand"
                      href={`/competitions/${submission.competitionId}/leaderboard`}
                    >
                      {t("competitions.leaderboard")}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : competitionsQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Loading competitions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <div className="text-lg font-semibold">
              {t("competitions.noCompetitions")}
            </div>
            <p className="mt-2 text-sm text-muted">
              Check back later for new challenges.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(item => (
              <div
                key={item._id}
                className="rounded-3xl border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,118,110,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      {item.title || item.name || "Competition"}
                    </div>
                    {item.subtitle ? (
                      <div className="mt-1 text-xs text-muted">
                        {item.subtitle}
                      </div>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${
                      statusStyle[getStatus(item)]
                    }`}
                  >
                    {t(`competitions.${getStatus(item)}`)}
                  </span>
                </div>

                <div className="mt-4 text-xs text-muted">
                  {item.durationInMinutes
                    ? `${item.durationInMinutes} mins`
                    : "—"}{" "}
                  · {item.totalQuestions ? `${item.totalQuestions} questions` : "—"}
                </div>
                <div className="mt-2 text-xs text-muted">
                  Starts {formatDateTime(item.startDateTime)}
                </div>

                {item.reward ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    Reward: {item.reward.type.replace("_", " ")} ·{" "}
                    {item.reward.value}
                  </div>
                ) : null}

                <div className="mt-6 flex items-center justify-between">
                  <a
                    className="text-sm font-semibold text-brand"
                    href={`/competitions/${item._id}`}
                  >
                    {t("common.view")}
                  </a>
                  {getStatus(item) === "live" ? (
                    <a
                      className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
                      href={`/competitions/${item._id}/exam`}
                    >
                      {t("competitions.start")}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
