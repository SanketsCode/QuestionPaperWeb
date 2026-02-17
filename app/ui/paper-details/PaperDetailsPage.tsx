"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaperFullDetails } from "../../lib/api";
import { useParams, useRouter } from "next/navigation";

export default function PaperDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const paperQuery = useQuery({
    queryKey: ["paper-details", id],
    queryFn: () => getPaperFullDetails(id),
    enabled: !!id,
  });

  if (paperQuery.isLoading) {
    return (
      <div className="px-6 py-10 text-sm text-muted">Loading paper...</div>
    );
  }

  const errorStatus = (paperQuery.error as any)?.response?.status;
  const paper = paperQuery.data;
  if (!paper) {
    return (
      <div className="px-6 py-10 text-sm text-muted">
        {errorStatus === 403 ? (
          <>
            Access to this paper is restricted.{" "}
            <a className="text-brand" href="/subscription">
              Upgrade your plan
            </a>
          </>
        ) : (
          "Paper not found."
        )}
      </div>
    );
  }

  const instructions = paper.instructions
    ? paper.instructions
        .split("\n")
        .map(item => item.trim().replace(/^[•\-\d]+\.?\s*/, ""))
        .filter(Boolean)
    : [
        "No calculators allowed.",
        "Each correct answer earns marks, wrong answers may have negative marks.",
        "Exam auto-submits when time ends.",
      ];

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Instructions
          </p>
          <h1 className="mt-3 font-display text-3xl">
            {paper.title || paper.exam_name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Prepare for the exam with clear instructions.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Duration
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.exam_due_min} mins
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Questions
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.total_que_count}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Total marks
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.total_marks}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Negative marking
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.has_negative_marking ? "0.25" : "0"}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-sm font-semibold">Important instructions</div>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {instructions.map(item => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
            onClick={() => router.back()}
          >
            Back
          </button>
          <a
            href={`/question-paper/${paper._id}`}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
          >
            Start test
          </a>
        </div>
      </div>
    </div>
  );
}
