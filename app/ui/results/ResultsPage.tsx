"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CompetitionSubmissionItem,
  PaperSubmissionItem,
  PaperType,
  getMyCompetitionSubmissions,
  getMyPaperSubmissions,
} from "../../lib/api";

type TabId = "papers" | "competitions";

const paperTypeLabel = (paperType: PaperType) => {
  switch (paperType) {
    case "REAL_EXAM":
      return "Previous paper";
    case "LATEST_PAPER":
      return "Latest paper";
    case "CUSTOM_PAPER":
      return "Custom test";
    default:
      return "Test";
  }
};

function formatDateTime(dateTime?: string) {
  if (!dateTime) return "";
  const d = new Date(dateTime);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("papers");
  const papersQuery = useQuery({
    queryKey: ["my-paper-submissions"],
    queryFn: getMyPaperSubmissions,
  });
  const competitionsQuery = useQuery({
    queryKey: ["my-competition-submissions"],
    queryFn: getMyCompetitionSubmissions,
  });

  const isLoading =
    activeTab === "papers" ? papersQuery.isLoading : competitionsQuery.isLoading;
  const isError =
    activeTab === "papers" ? papersQuery.isError : competitionsQuery.isError;

  const data = useMemo(() => {
    if (activeTab === "papers") return papersQuery.data || [];
    return competitionsQuery.data || [];
  }, [activeTab, papersQuery.data, competitionsQuery.data]);

  const renderPaperItem = (item: PaperSubmissionItem) => {
    const title = item.paper?.title || "Test";
    const subtitle = paperTypeLabel(item.paperType);
    const scoreText = `${item.score} / ${item.totalMarks}`;
    const dateText = formatDateTime(item.createdAt);
    const href =
      item.paperType === "CUSTOM_PAPER"
        ? `/question-paper/${item.paperId}?custom=1`
        : `/question-paper/${item.paperId}`;

    return (
      <a
        key={item._id}
        href={href}
        className="rounded-3xl border border-border bg-card p-5 shadow-[0_18px_45px_rgba(15,118,110,0.08)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-2 text-xs text-muted">
              {subtitle}
              {dateText ? ` · ${dateText}` : ""}
            </div>
          </div>
          <div className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {scoreText}
          </div>
        </div>
        <div className="mt-3 text-xs text-muted">
          {item.correctCount} correct · {item.wrongCount} wrong ·{" "}
          {item.totalQuestions} questions
        </div>
      </a>
    );
  };

  const renderCompetitionItem = (item: CompetitionSubmissionItem) => {
    const title = item.competition?.title || "Competition";
    const dateText = formatDateTime(item.submittedAt || item.startedAt);
    const status = item.status.toUpperCase();
    const scoreText = `${item.score} / ${
      item.competition?.totalMarks ?? ""
    }`.trim();
    const href = `/competitions/${item.competition?._id || item.competitionId}`;

    return (
      <a
        key={item._id}
        href={href}
        className="rounded-3xl border border-border bg-card p-5 shadow-[0_18px_45px_rgba(15,118,110,0.08)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-2 text-xs text-muted">
              {dateText || "—"}
              {item.status === "submitted" && scoreText ? ` · ${scoreText}` : ""}
            </div>
          </div>
          <div
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${
              item.status === "submitted"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-700"
            }`}
          >
            {status}
          </div>
        </div>
        {item.status === "submitted" ? (
          <div className="mt-3 text-xs text-muted">
            {item.correctCount} correct · {item.wrongCount} wrong ·{" "}
            {Math.round((item.timeTaken || 0) / 60)} mins
          </div>
        ) : (
          <div className="mt-3 text-xs text-muted">Attempt started</div>
        )}
      </a>
    );
  };

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Results
          </p>
          <h1 className="mt-3 font-display text-3xl">
            Track your recent submissions
          </h1>
        </header>

        <div className="flex flex-wrap gap-2 rounded-full border border-border bg-white/70 p-2">
          {(["papers", "competitions"] as TabId[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === tab
                  ? "bg-brand text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab === "papers" ? "Papers" : "Competitions"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Loading results...
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Unable to load results. Please try again.
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
            No results yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {activeTab === "papers"
              ? (data as PaperSubmissionItem[]).map(renderPaperItem)
              : (data as CompetitionSubmissionItem[]).map(renderCompetitionItem)}
          </div>
        )}
      </div>
    </div>
  );
}
