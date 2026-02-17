"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createCustomPaper, getSubjects } from "../../lib/api";
import { getPapersCreatedToday, saveCustomPaper } from "../../lib/customPapers";
import { useRouter } from "next/navigation";

const questionOptions = [10, 25, 50, 100];
const durationOptions = [15, 30, 60, 120];
const difficultyOptions = ["EASY", "MEDIUM", "HARD"] as const;

export default function CreateTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(25);
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] =
    useState<(typeof difficultyOptions)[number]>("EASY");
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("qp_user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const isFreeUser = !user?.planName || user?.planName?.toLowerCase() === "free";

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  useEffect(() => {
    if (!subject && subjectsQuery.data?.length) {
      setSubject(subjectsQuery.data[0].name);
    }
  }, [subject, subjectsQuery.data]);

  const createMutation = useMutation({
    mutationFn: createCustomPaper,
    onSuccess: async data => {
      await saveCustomPaper(data);
      router.push("/test");
    },
    onError: (err: any) => {
      if (err?.response?.status === 403) {
        setLimitReached(true);
      } else {
        setError("Failed to create custom test.");
      }
    },
  });

  const handleCreate = async () => {
    setError("");
    setLimitReached(false);
    if (!subject) {
      setError("Select a subject.");
      return;
    }
    if (isFreeUser) {
      const createdToday = await getPapersCreatedToday();
      if (createdToday >= 2) {
        setLimitReached(true);
        return;
      }
    }
    const paperTitle = title || `${subject} - ${difficulty} Level`;
    createMutation.mutate({
      title: paperTitle,
      subject,
      questionCount,
      duration,
      difficulty,
    });
  };

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Create test
          </p>
          <h1 className="mt-3 font-display text-3xl">
            Build a custom practice set
          </h1>
        </header>

        <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
          <div>
            <label className="text-sm font-semibold">Title (optional)</label>
            <input
              value={title}
              onChange={event => setTitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              placeholder="e.g. Algebra - Medium"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Subject</label>
            {subjectsQuery.isLoading ? (
              <div className="mt-2 text-sm text-muted">
                Loading subjects...
              </div>
            ) : (
              <select
                value={subject}
                onChange={event => setSubject(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              >
                {(subjectsQuery.data || []).map(item => (
                  <option key={item._id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Questions</label>
              <select
                value={questionCount}
                onChange={event => setQuestionCount(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              >
                {(isFreeUser ? questionOptions.slice(0, 2) : questionOptions).map(
                  count => (
                    <option key={count} value={count}>
                      {count} questions
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Duration</label>
              <select
                value={duration}
                onChange={event => setDuration(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              >
                {durationOptions.map(minutes => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Difficulty</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {difficultyOptions.map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    difficulty === level
                      ? "bg-brand text-white"
                      : "border border-border bg-white text-muted"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {limitReached ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You’ve reached today’s free limit. Upgrade your plan to create more.
              <a className="ml-2 font-semibold" href="/subscription">
                Upgrade
              </a>
            </div>
          ) : null}

          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {createMutation.isPending ? "Creating..." : "Create test"}
          </button>
        </div>
      </div>
    </div>
  );
}
