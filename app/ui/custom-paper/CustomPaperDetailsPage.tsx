"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteCustomPaper, getCustomPaperById } from "../../lib/customPapers";
import { useParams, useRouter } from "next/navigation";

export default function CustomPaperDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const paperQuery = useQuery({
    queryKey: ["custom-paper", id],
    queryFn: () => getCustomPaperById(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomPaper,
    onSuccess: () => {
      router.push("/test");
    },
  });

  if (paperQuery.isLoading) {
    return (
      <div className="px-6 py-10 text-sm text-muted">
        Loading custom paper...
      </div>
    );
  }

  const paper = paperQuery.data;
  if (!paper) {
    return (
      <div className="px-6 py-10 text-sm text-muted">Paper not found.</div>
    );
  }

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Custom paper
          </p>
          <h1 className="mt-3 font-display text-3xl">{paper.title}</h1>
          <p className="mt-2 text-sm text-muted">{paper.subject}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Questions
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.questionCount}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Duration
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.duration} mins
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Difficulty
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.difficulty}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`/question-paper/${paper._id}?custom=1`}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
          >
            Start test
          </a>
          <button
            className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-700"
            onClick={() => deleteMutation.mutate(paper._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
