"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Competition,
  getCompetitionById,
  getMyCompetitionSubmissions,
  startCompetitionExam,
} from "../../lib/api";
import { useLanguage } from "../LanguageContext";

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

export default function CompetitionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { t } = useLanguage();

  const competitionQuery = useQuery({
    queryKey: ["competition", id],
    queryFn: () => getCompetitionById(id),
    enabled: !!id,
  });

  const submissionsQuery = useQuery({
    queryKey: ["my-competition-submissions"],
    queryFn: getMyCompetitionSubmissions,
  });

  const startMutation = useMutation({
    mutationFn: startCompetitionExam,
    onSuccess: () => {
      router.push(`/competitions/${id}/exam`);
    },
  });

  if (competitionQuery.isLoading) {
    return (
      <div className="px-6 py-10 text-sm text-muted">
        Loading competition...
      </div>
    );
  }

  const competition = competitionQuery.data as Competition | undefined;
  if (!competition) {
    return (
      <div className="px-6 py-10 text-sm text-muted">
        Competition not found.
      </div>
    );
  }

  const submission = (submissionsQuery.data || []).find(
    s => s.competitionId === id
  );
  const status = (competition.status || "upcoming").toLowerCase();
  const hasSubmitted = submission?.status === "submitted";
  const hasStarted = submission?.status === "started";

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Competition details
          </p>
          <h1 className="mt-3 font-display text-3xl">
            {competition.title || competition.name}
          </h1>
          {competition.subtitle ? (
            <p className="mt-2 text-sm text-muted">{competition.subtitle}</p>
          ) : null}
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Schedule
            </div>
            <div className="mt-4 text-sm">
              Starts {formatDateTime(competition.startDateTime)}
            </div>
            <div className="mt-2 text-sm text-muted">
              Ends {formatDateTime(competition.endDateTime)}
            </div>
            <div className="mt-4 text-sm">
              Duration {competition.durationInMinutes || "—"} mins
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-white/70 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Overview
            </div>
            <div className="mt-4 text-sm text-muted">
              {competition.description || "Prepare and compete with peers."}
            </div>
            <div className="mt-4 text-sm">
              Questions: {competition.totalQuestions || "—"}
            </div>
            <div className="mt-2 text-sm">
              Total marks: {competition.totalMarks || "—"}
            </div>
            {competition.reward ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                Reward: {competition.reward.type.replace("_", " ")} ·{" "}
                {competition.reward.value}
              </div>
            ) : null}
          </div>
        </div>

        {competition.instructions ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            {competition.instructions}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
            onClick={() => router.push("/competitions")}
          >
            {t("common.back")}
          </button>
          
          {hasSubmitted ? (
             <button
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
              onClick={() => router.push(`/competitions/${id}/leaderboard`)}
            >
              {t("competitions.viewResult")}
            </button>
          ) : hasStarted && status === "live" ? (
             <button
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={() => router.push(`/competitions/${id}/exam`)}
            >
              {t("competitions.resume")}
            </button>
          ) : (
            <button
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              disabled={status !== "live"}
              onClick={() => startMutation.mutate(id)}
            >
              {status === "live" 
                ? t("competitions.start") 
                : status === "completed" 
                    ? t("competitions.completed") 
                    : "Start when live"}
            </button>
          )}

          <button
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
            onClick={() => router.push(`/competitions/${id}/leaderboard`)}
          >
            {t("competitions.leaderboard")}
          </button>
        </div>
      </div>
    </div>
  );
}
