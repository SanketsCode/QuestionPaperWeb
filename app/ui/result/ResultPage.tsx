"use client";

import { useEffect, useState } from "react";
import { ExamResult, QuestionPaperFull } from "../../lib/api";
import { useLanguage } from "../LanguageContext";

type ResultState = {
  result: ExamResult;
  paper: QuestionPaperFull;
};

export default function ResultPage() {
  const [state, setState] = useState<ResultState | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("qp_last_result");
    if (raw) {
      setState(JSON.parse(raw));
    }
  }, []);

  if (!state) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted">
        {t("results.noResults") || "No results found."}{" "}
        <a className="text-brand" href="/home">
          {t("results.backHome")}
        </a>
      </div>
    );
  }

  const { result, paper } = state;
  const isQualified = result.percentage >= 35;
  const scoreColor = isQualified ? "text-emerald-600" : "text-rose-600";
  const badgeColor = isQualified
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {t("results.title")}
          </p>
          <h1 className="mt-3 font-display text-3xl">
            {paper.exam_name} {t("results.analysis")}
          </h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-white">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-8 border-emerald-200">
                <div className={`text-3xl font-semibold ${scoreColor}`}>
                  {result.score}
                </div>
                <div className="text-xs text-muted">/ {result.totalMarks}</div>
              </div>
            </div>
            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badgeColor}`}
            >
              {isQualified ? t("results.qualified") : t("results.notQualified")}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                {t("results.percentage")}
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {result.percentage}%
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                {t("results.accuracy")}
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {result.accuracy}%
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                {t("results.correct")}
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {result.correct}/{result.totalQuestions}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                {t("results.wrong")}
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {result.incorrect}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`/question-paper/${paper._id}`}
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
          >
            {t("results.retake")}
          </a>
          <a
            href="/solution"
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
          >
            {t("results.viewSolutions")}
          </a>
          <a
            href="/home"
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            {t("results.backHome")}
          </a>
        </div>
      </div>
    </div>
  );
}
