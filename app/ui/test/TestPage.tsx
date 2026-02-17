"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCustomPaper, getCustomPaperList } from "../../lib/customPapers";

const difficultyColor: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function TestPage() {
  const queryClient = useQueryClient();
  const papersQuery = useQuery({
    queryKey: ["customPapers"],
    queryFn: getCustomPaperList,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomPaper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPapers"] });
    },
  });

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[28px] border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Custom tests
            </p>
            <h1 className="mt-3 font-display text-3xl">
              Your created practice papers
            </h1>
            <p className="mt-2 text-sm text-muted">
              Build your own test sets and keep them organized here.
            </p>
          </div>
          <a
            href="/create-test"
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(15,118,110,0.35)]"
          >
            Create new test
          </a>
        </header>

        {papersQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Loading custom papers...
          </div>
        ) : papersQuery.data && papersQuery.data.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {papersQuery.data.map(item => (
              <div
                key={item._id}
                className="rounded-3xl border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,118,110,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="mt-2 text-xs text-muted">
                      {item.subject} · {item.questionCount} questions ·{" "}
                      {item.duration} mins
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${difficultyColor[item.difficulty]}`}
                  >
                    {item.difficulty}
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <a
                    href={`/question-paper/${item._id}?custom=1`}
                    className="text-sm font-semibold text-brand"
                  >
                    Start
                  </a>
                  <button
                    onClick={() => deleteMutation.mutate(item._id)}
                    className="text-xs font-semibold text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <div className="text-lg font-semibold">No custom papers yet</div>
            <p className="mt-2 text-sm text-muted">
              Create your first custom test to see it listed here.
            </p>
            <a
              href="/create-test"
              className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(15,118,110,0.35)]"
            >
              Create test
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
