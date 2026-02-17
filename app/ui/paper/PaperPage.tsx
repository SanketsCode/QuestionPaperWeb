"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  ExamCategory,
  ExamSubCategory,
  QuestionPaper,
  getExamCategories,
  getExamSubCategories,
  getQuestionPapersPaged,
} from "../../lib/api";

export default function PaperPage() {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<ExamSubCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["paper", "categories"],
    queryFn: getExamCategories,
  });

  useEffect(() => {
    if (!selectedCategory && categoriesQuery.data?.length) {
      setSelectedCategory(categoriesQuery.data[0]);
    }
  }, [categoriesQuery.data, selectedCategory]);

  const subCategoriesQuery = useQuery({
    queryKey: ["paper", "subcategories", selectedCategory?._id],
    queryFn: () => getExamSubCategories(selectedCategory?._id || ""),
    enabled: !!selectedCategory?._id,
  });

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedSubCategory(null);
      return;
    }
    const active = (subCategoriesQuery.data ?? []).filter(s => s.is_active);
    if (!active.length) {
      setSelectedSubCategory(null);
      return;
    }
    if (!selectedSubCategory || !active.some(s => s._id === selectedSubCategory._id)) {
      setSelectedSubCategory(active[0]);
    }
  }, [selectedCategory, selectedSubCategory, subCategoriesQuery.data]);

  const papersQuery = useInfiniteQuery({
    queryKey: [
      "paper",
      "real-exams",
      selectedCategory?._id,
      selectedSubCategory?._id,
      appliedSearch,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!selectedCategory?._id) return [];
      return getQuestionPapersPaged({
        categoryId: selectedCategory._id,
        subcategoryId: selectedSubCategory?._id,
        search: appliedSearch.trim() || undefined,
        is_real_exam: true,
        page: pageParam as number,
        limit: 10,
      });
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!selectedCategory?._id,
  });

  const papers: QuestionPaper[] = useMemo(
    () => papersQuery.data?.pages.flatMap(page => page) ?? [],
    [papersQuery.data]
  );

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Exam papers
          </p>
          <h1 className="mt-3 font-display text-3xl">
            Previous year & real exams
          </h1>
        </header>

        <div className="rounded-3xl border border-border bg-white/70 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.2em] text-muted">
                Search
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Search by exam name"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                />
                <button
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setAppliedSearch(searchQuery)}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(categoriesQuery.data ?? []).map(category => (
              <button
                key={category._id}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedSubCategory(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  selectedCategory?._id === category._id
                    ? "bg-brand text-white"
                    : "border border-border bg-white text-muted"
                }`}
              >
                {category.category_name}
              </button>
            ))}
          </div>
          {subCategoriesQuery.data?.length ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              {(subCategoriesQuery.data ?? [])
                .filter(sub => sub.is_active)
                .map(sub => (
                  <button
                    key={sub._id}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selectedSubCategory?._id === sub._id
                        ? "bg-brand text-white"
                        : "border border-border bg-white text-muted"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
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
        ) : papers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
            No papers found.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {papers.map(paper => (
              <a
                key={paper._id}
                href={`/paper-details/${paper._id}`}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="text-sm font-semibold">
                  {paper.exam_name || paper.title}
                </div>
                <div className="mt-2 text-xs text-muted">
                  {paper.total_que_count || paper.total_questions || 0} questions ·{" "}
                  {paper.duration || paper.exam_due_min || 0} mins
                </div>
              </a>
            ))}
          </div>
        )}

        {papersQuery.hasNextPage ? (
          <div className="flex justify-center">
            <button
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
              onClick={() => papersQuery.fetchNextPage()}
              disabled={papersQuery.isFetchingNextPage}
            >
              {papersQuery.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
