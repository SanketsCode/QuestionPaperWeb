"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "./LanguageContext";
import {
  Competition,
  ExamCategory,
  QuestionPaper,
  Subject,
  getCompetitions,
  getExamCategories,
  getQuestionPapers,
  getSubjects,
} from "../lib/api";

const features = [
  {
    title: "Smart practice sets",
    description:
      "Pick a category, filter by difficulty, and build focused practice sets in seconds.",
  },
  {
    title: "Timed competitions",
    description:
      "Join live challenges with real-time status and leaderboard-ready submissions.",
  },
  {
    title: "Performance insights",
    description:
      "Track speed, accuracy, and strengths with analytics that update after every attempt.",
  },
  {
    title: "My Academy",
    description:
      "Centralize upcoming tests, notifications, and curated question banks.",
  },
];

const steps = [
  {
    title: "Pick your exam",
    description: "Choose a category or subject tailored to your syllabus.",
  },
  {
    title: "Solve with intent",
    description: "Attempt papers with timers, hints, and clean answer flows.",
  },
  {
    title: "Measure and improve",
    description:
      "Review analytics and keep improving with targeted follow-up sets.",
  },
];

function formatDuration(minutes?: number) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function getPaperMeta(paper: QuestionPaper) {
  const total =
    paper.total_questions ?? paper.total_que_count ?? undefined;
  const duration = paper.duration ? `${paper.duration} mins` : "—";
  return {
    total,
    duration,
    title: paper.title || paper.exam_name || "Untitled Paper",
  };
}

function getCompetitionTitle(competition: Competition) {
  return competition.title || competition.name || "Competition";
}

function getCompetitionStatus(competition: Competition) {
  if (competition.status) return competition.status;
  return "upcoming";
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted">
      <span className="font-semibold text-foreground">{value}</span>{" "}
      <span>{label}</span>
    </div>
  );
}

function DataCard({
  title,
  items,
  empty,
}: {
  title: string;
  items: { id: string; primary: string; secondary?: string }[];
  empty: string;
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,118,110,0.08)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          Live
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted">{empty}</p>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/60 bg-white/70 px-4 py-3"
            >
              <div className="text-sm font-semibold">{item.primary}</div>
              {item.secondary ? (
                <div className="text-xs text-muted">{item.secondary}</div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getExamCategories,
  });

  const { t } = useLanguage();

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const competitionsQuery = useQuery({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
  });

  const papersQuery = useQuery({
    queryKey: ["papers"],
    queryFn: getQuestionPapers,
  });

  const stats = useMemo(() => {
    const categories = categoriesQuery.data?.length ?? 0;
    const subjects = subjectsQuery.data?.length ?? 0;
    const competitions = competitionsQuery.data?.length ?? 0;
    const papers = papersQuery.data?.length ?? 0;
    return { categories, subjects, competitions, papers };
  }, [
    categoriesQuery.data,
    subjectsQuery.data,
    competitionsQuery.data,
    papersQuery.data,
  ]);

  const categoryItems =
    categoriesQuery.data?.slice(0, 4).map((category: ExamCategory) => ({
      id: category._id,
      primary: category.category_name,
      secondary: category.description || "Curated practice tracks",
    })) ?? [];

  const subjectItems =
    subjectsQuery.data?.slice(0, 4).map((subject: Subject) => ({
      id: subject._id,
      primary: subject.name,
      secondary: subject.description || "Topic-focused coverage",
    })) ?? [];

  const competitionItems =
    competitionsQuery.data?.slice(0, 4).map((competition: Competition) => ({
      id: competition._id,
      primary: getCompetitionTitle(competition),
      secondary: `${getCompetitionStatus(competition)} · ${formatDuration(
        competition.durationInMinutes
      )}`,
    })) ?? [];

  const paperItems =
    papersQuery.data?.slice(0, 4).map((paper: QuestionPaper) => {
      const meta = getPaperMeta(paper);
      return {
        id: paper._id,
        primary: meta.title,
        secondary: `${
          meta.total ? `${meta.total} questions` : "Practice set"
        } · ${meta.duration}`,
      };
    }) ?? [];

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 md:px-10">
        <nav className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 font-display text-lg">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              QP
            </span>
            QuestionPaper
          </div>
          <div className="hidden items-center gap-6 text-muted md:flex">
            <a className="hover:text-foreground" href="#features">
              {t("nav.features") || "Features"}
            </a>
            <a className="hover:text-foreground" href="#live">
              {t("nav.liveData") || "Live Data"}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="hidden rounded-full border border-border px-4 py-2 text-sm md:inline-flex"
              href="/login"
            >
              {t("nav.login")}
            </Link>
            <Link
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(15,118,110,0.35)]"
              href="/login"
            >
              {t("nav.getStarted") || "Get started"}
            </Link>
          </div>
        </nav>

        <section className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {t("landing.hero.badge")}
            </div>
            <h1 className="font-display text-4xl leading-tight md:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="max-w-xl text-lg text-muted">
              {t("landing.hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(15,118,110,0.35)]"
                href="/home"
              >
                {t("landing.hero.start")}
              </a>
              <a
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold"
                href="#live"
              >
                {t("landing.hero.explore")}
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              <StatPill label={t("landing.stats.categories")} value={stats.categories} />
              <StatPill label={t("landing.stats.subjects")} value={stats.subjects} />
              <StatPill label={t("landing.stats.competitions")} value={stats.competitions} />
              <StatPill label={t("landing.stats.papers")} value={stats.papers} />
            </div>
          </div>
          <div className="rounded-[32px] border border-border bg-card p-8 shadow-[0_30px_60px_rgba(15,118,110,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Weekly focus
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Your practice studio
                </h2>
              </div>
              <div className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-brand-dark">
                New
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="text-sm font-semibold">Daily streak</div>
                <div className="mt-2 h-2 w-full rounded-full bg-border">
                  <div className="h-full w-3/4 rounded-full bg-brand" />
                </div>
                <div className="mt-2 text-xs text-muted">
                  6 days practice in a row
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white/80 p-4">
                  <div className="text-sm font-semibold">Accuracy</div>
                  <div className="mt-3 text-2xl font-semibold">82%</div>
                  <div className="text-xs text-muted">+5% this week</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/80 p-4">
                  <div className="text-sm font-semibold">Avg. speed</div>
                  <div className="mt-3 text-2xl font-semibold">68 sec</div>
                  <div className="text-xs text-muted">per question</div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-gradient-to-r from-brand/10 to-accent/20 p-4">
                <div className="text-sm font-semibold">Next competition</div>
                <div className="mt-2 text-lg font-semibold">
                  National Mock Sprint
                </div>
                <div className="text-xs text-muted">
                  Starts in 2 days · 90 mins
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="features" className="bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {t("landing.features.badge")}
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">
                {t("landing.features.title")}
              </h2>
            </div>
            <p className="max-w-xl text-sm text-muted">
              {t("landing.features.description")}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              "smartPractice",
              "competitions",
              "insights",
              "academy",
            ].map((key) => (
              <div
                key={key}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <h3 className="text-lg font-semibold">{t(`landing.features.${key}.title`)}</h3>
                <p className="mt-3 text-sm text-muted">{t(`landing.features.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="live" className="py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {t("landing.live.badge")}
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">
                {t("landing.live.title")}
              </h2>
            </div>
            <div className="text-sm text-muted">
              {t("landing.live.notes")}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <DataCard
              title={t("landing.live.categories")}
              items={categoryItems}
              empty={
                categoriesQuery.isLoading
                  ? t("common.loading")
                  : t("landing.live.empty")
              }
            />
            <DataCard
              title={t("landing.live.subjects")}
              items={subjectItems}
              empty={
                subjectsQuery.isLoading
                  ? t("common.loading")
                  : t("landing.live.empty")
              }
            />
            <DataCard
              title={t("landing.live.competitions")}
              items={competitionItems}
              empty={
                competitionsQuery.isLoading
                  ? t("common.loading")
                  : t("landing.live.empty")
              }
            />
            <DataCard
              title={t("landing.live.papers")}
              items={paperItems}
              empty={
                papersQuery.isLoading
                  ? t("common.loading")
                  : t("landing.live.empty")
              }
            />
          </div>
        </div>
      </section>

      <section id="flow" className="bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-3xl border border-border bg-card p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {t("landing.flow.badge")}
              </p>
              <h2 className="mt-4 font-display text-3xl">
                {t("landing.flow.title")}
              </h2>
              <div className="mt-6 flex flex-col gap-4">
                {t("landing.flow.steps").map((step: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-4 rounded-2xl border border-border bg-white/80 p-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{step.title}</div>
                      <div className="text-xs text-muted">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-3xl border border-border bg-gradient-to-br from-brand/10 via-white/80 to-accent/20 p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {t("landing.flow.responsive.badge")}
              </p>
              <h3 className="mt-4 font-display text-3xl">
                {t("landing.flow.responsive.title")}
              </h3>
              <p className="mt-4 text-sm text-muted">
                {t("landing.flow.responsive.desc")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {t("landing.flow.responsive.badges").map((badge: string, index: number) => (
                  <div key={index} className="rounded-full border border-border bg-card px-4 py-2 text-xs">
                    {badge}
                  </div>
                ))}
              </div>
              <button className="mt-8 w-fit rounded-full bg-brand-dark px-6 py-3 text-sm font-semibold text-white">
                {t("landing.flow.responsive.build")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="rounded-[36px] border border-border bg-brand px-8 py-12 text-white md:px-14">
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                  {t("landing.cta.badge")}
                </p>
                <h2 className="mt-4 font-display text-3xl md:text-4xl">
                  {t("landing.cta.title")}
                </h2>
                <p className="mt-3 text-sm text-white/80">
                  {t("landing.cta.desc")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-dark">
                  {t("landing.cta.demo")}
                </button>
                <button className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white">
                  {t("landing.cta.launch")}
                </button>
              </div>
            </div>
          </div>
          <footer className="mt-10 flex flex-col gap-4 text-xs text-muted md:flex-row md:items-center md:justify-between">
            <div>{t("nav.copyright") || "QuestionPaper © 2026. All rights reserved."}</div>
            <div className="flex flex-wrap gap-6">
              <span>{t("nav.privacy")}</span>
              <span>{t("nav.terms")}</span>
              <span>{t("nav.support")}</span>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
