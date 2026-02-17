"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  Competition,
  ExamCategory,
  ExamSubCategory,
  QuestionPaper,
  getCompetitions,
  getExamCategories,
  getExamSubCategories,
  getQuestionPapersPaged,
  // QuestionPaper, // Removed duplicate import
  // getRecentActivity, // Removed non-existent import
} from "../../lib/api";
import { useLanguage } from "../LanguageContext";
import { useRouter } from "next/navigation";

const cardColors = [
  "from-sky-500/15 to-sky-500/0",
  "from-violet-500/15 to-violet-500/0",
  "from-rose-500/15 to-rose-500/0",
  "from-amber-500/15 to-amber-500/0",
  "from-emerald-500/15 to-emerald-500/0",
  "from-indigo-500/15 to-indigo-500/0",
];

function getCompetitionStatus(competition: Competition) {
  if (competition.status) return competition.status;
  return "upcoming";
}

function formatDuration(minutes?: number) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function PaperCard({
  paper,
  accent,
}: {
  paper: QuestionPaper;
  accent: string;
}) {
  const total = paper.total_questions ?? paper.total_que_count;
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_18px_45px_rgba(15,118,110,0.08)]">
      <div
        className={`rounded-2xl border border-border bg-gradient-to-r ${accent} p-4`}
      >
        <div className="text-sm font-semibold">
          {paper.title || paper.exam_name || "Untitled Paper"}
        </div>
        <div className="mt-2 text-xs text-muted">
          {total ? `${total} questions` : "Practice set"} ·{" "}
          {paper.duration ? `${paper.duration} mins` : "—"}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>Updated recently</span>
        <a
          className="font-semibold text-brand"
          href={`/paper-details/${paper._id}`}
        >
          View
        </a>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<ExamSubCategory | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["home", "categories"],
    queryFn: getExamCategories,
  });

  useEffect(() => {
    if (!selectedCategory && categoriesQuery.data?.length) {
      setSelectedCategory(categoriesQuery.data[0]);
    }
  }, [categoriesQuery.data, selectedCategory]);

  const subCategoriesQuery = useQuery({
    queryKey: ["home", "subcategories", selectedCategory?._id],
    queryFn: () => getExamSubCategories(selectedCategory?._id || ""),
    enabled: !!selectedCategory?._id,
  });

  const competitionsQuery = useQuery({
    queryKey: ["home", "competitions"],
    queryFn: getCompetitions,
  });

  const papersQuery = useInfiniteQuery({
    queryKey: [
      "home",
      "papers",
      selectedCategory?._id,
      selectedSubCategory?._id,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!selectedCategory?._id) return [];
      return getQuestionPapersPaged({
        categoryId: selectedCategory._id,
        subcategoryId: selectedSubCategory?._id,
        is_real_exam: false,
        page: pageParam as number,
        limit: 8,
      });
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length < 8) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!selectedCategory?._id,
  });

  const paperItems = useMemo(
    () => papersQuery.data?.pages.flatMap(page => page) ?? [],
    [papersQuery.data]
  );

  const promoCompetitions = useMemo(() => {
    const list = competitionsQuery.data ?? [];
    const live = list.filter(c => getCompetitionStatus(c) === "live");
    const upcoming = list.filter(c => getCompetitionStatus(c) === "upcoming");
    return [...live, ...upcoming].slice(0, 3);
  }, [competitionsQuery.data]);

  const activeSubCategories = (subCategoriesQuery.data ?? []).filter(
    sub => sub.is_active
  );

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-6 rounded-[32px] border border-border bg-card p-8 shadow-[0_25px_60px_rgba(15,118,110,0.12)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Dashboard
            </p>
            <h1 className="mt-3 font-display text-3xl md:text-4xl">
              {t("home.welcome")}
            </h1>
            <p className="mt-3 text-sm text-muted">
              Select an exam category, take a mock test, or join competitions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
              href="/profile"
            >
              {t("nav.profile")}
            </a>
            <a
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(15,118,110,0.35)]"
              href="/paper"
            >
              Start a practice
            </a>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="/paper"
            className="rounded-3xl border border-border bg-card p-5"
          >
            <div className="text-sm font-semibold">Exam categories</div>
            <div className="mt-2 text-xs text-muted">
              Browse previous papers by category.
            </div>
          </a>
          <a
            href="/test"
            className="rounded-3xl border border-border bg-card p-5"
          >
            <div className="text-sm font-semibold">Mock tests</div>
            <div className="mt-2 text-xs text-muted">
              Create custom tests and track progress.
            </div>
          </a>
          <a
            href="/competitions"
            className="rounded-3xl border border-border bg-card p-5"
          >
            <div className="text-sm font-semibold">Competitions</div>
            <div className="mt-2 text-xs text-muted">
              Join live challenges and leaderboards.
            </div>
          </a>
          <a
            href="/my-academy"
            className="rounded-3xl border border-border bg-card p-5"
          >
            <div className="text-sm font-semibold">My Academy</div>
            <div className="mt-2 text-xs text-muted">
              Upcoming exams, notifications, and papers.
            </div>
          </a>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-border bg-white/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Live competitions
                </p>
                <h2 className="mt-2 font-display text-2xl">
                  Compete in real time
                </h2>
              </div>
              <button className="text-xs font-semibold text-brand">
                View all
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              {competitionsQuery.isLoading ? (
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
                  Loading competitions...
                </div>
              ) : promoCompetitions.length ? (
                promoCompetitions.map(item => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="text-sm font-semibold">
                      {item.title || item.name || "Competition"}
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      {getCompetitionStatus(item)} ·{" "}
                      {formatDuration(item.durationInMinutes)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
                  No competitions available right now.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Focus area
            </p>
            <h2 className="mt-2 font-display text-2xl">
              Choose your exam category
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {(categoriesQuery.data ?? []).map(category => {
                const isSelected = selectedCategory?._id === category._id;
                return (
                  <button
                    key={category._id}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedSubCategory(null);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                      isSelected
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-white/70 text-foreground"
                    }`}
                  >
                    {category.category_name}
                  </button>
                );
              })}
            </div>

            {activeSubCategories.length > 0 ? (
              <div className="mt-6 border-t border-border pt-4">
                <div className="flex flex-wrap gap-2">
                  {activeSubCategories.map(sub => {
                    const isSelected = selectedSubCategory?._id === sub._id;
                    return (
                      <button
                        key={sub._id}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          isSelected
                            ? "border-brand bg-brand text-white"
                            : "border-border bg-white text-foreground"
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Newly added
              </p>
              <h2 className="mt-2 font-display text-2xl">
                Latest question papers
              </h2>
            </div>
            {selectedCategory ? (
              <div className="text-sm text-muted">
                Showing {selectedCategory.category_name}
              </div>
            ) : null}
          </div>

          {papersQuery.isLoading ? (
            <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
              Loading papers...
            </div>
          ) : papersQuery.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Unable to load papers.
            </div>
          ) : paperItems.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
              No papers found for this category.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {paperItems.map((paper, index) => (
                <PaperCard
                  key={paper._id}
                  paper={paper}
                  accent={cardColors[index % cardColors.length]}
                />
              ))}
            </div>
          )}

          <div className="flex justify-center">
            {papersQuery.hasNextPage ? (
              <button
                onClick={() => papersQuery.fetchNextPage()}
                disabled={papersQuery.isFetchingNextPage}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
              >
                {papersQuery.isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
