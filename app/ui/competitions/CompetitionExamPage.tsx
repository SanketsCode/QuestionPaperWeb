"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  CompetitionSession,
  submitCompetitionExam,
  startCompetitionExam,
} from "../../lib/api";
import { useParams, useRouter } from "next/navigation";

type ResolvedContent = { text: string; image?: string };

const getContent = (content: any, lang: string): ResolvedContent => {
  if (!content) return { text: "" };
  const data = content[lang] || content["en"] || Object.values(content)[0];
  return { text: data?.text || "", image: data?.image_url };
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function CompetitionExamPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [session, setSession] = useState<CompetitionSession | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const serverOffsetRef = useRef(0);
  const hasSubmittedRef = useRef(false);

  const startMutation = useMutation({
    mutationFn: startCompetitionExam,
    onSuccess: data => {
      setSession(data);
      setQuestions(data.questions || []);
      serverOffsetRef.current = Date.parse(data.serverNow) - Date.now();
      setTimeLeft(data.timeLeftSeconds);
      const lang = data.competition?.languagesAvailable?.[0] || "en";
      setSelectedLanguage(lang);
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({
      competitionId,
      payload,
    }: {
      competitionId: string;
      payload: { answers: { questionId: string; selectedOptionId: number }[] };
    }) => submitCompetitionExam(competitionId, payload),
  });

  useEffect(() => {
    if (!id || session) return;
    startMutation.mutate(id);
  }, [id, session, startMutation]);

  useEffect(() => {
    if (!session) return;
    const endMs = Date.parse(session.endDateTime);
    const interval = setInterval(() => {
      const nowMs = Date.now() + serverOffsetRef.current;
      const secondsLeft = Math.max(0, Math.floor((endMs - nowMs) / 1000));
      setTimeLeft(secondsLeft);
    }, 500);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (timeLeft !== 0) return;
    handleSubmit(true);
  }, [timeLeft, session]);

  const handleSubmit = async (auto = false) => {
    if (hasSubmittedRef.current) return;
    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })
    );
    try {
      hasSubmittedRef.current = true;
      await submitMutation.mutateAsync({
        competitionId: id,
        payload: { answers: formattedAnswers },
      });
      router.replace(`/competitions/${id}/leaderboard`);
    } catch {
      hasSubmittedRef.current = false;
      if (!auto) {
        alert("Submission failed. Please try again.");
      }
    }
  };

  const questionStatus = useMemo(() => {
    return questions.map((question, index) => ({
      index,
      answered: answers[question._id] !== undefined,
    }));
  }, [questions, answers]);

  if (startMutation.isPending || !session) {
    return (
      <div className="px-6 py-10 text-sm text-muted">
        Starting competition...
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="px-6 py-10 text-sm text-muted">
        No questions available.
      </div>
    );
  }

  const questionContent = getContent(
    currentQuestion.que_content,
    selectedLanguage
  );
  const options = (currentQuestion.options || []).map((opt: any) =>
    getContent(opt.content, selectedLanguage)
  );

  return (
    <div className="min-h-screen px-6 py-6 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
          <button
            className="text-sm font-semibold text-muted"
            onClick={() => router.back()}
          >
            Exit
          </button>
          <div className="text-sm font-semibold">
            {session.competition?.title}
          </div>
          <div className="text-sm text-muted">
            {currentQuestionIndex + 1}/{questions.length}
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white/70 p-4">
          <div className="text-sm font-semibold text-brand">
            Time left: {formatTime(timeLeft)}
          </div>
          <select
            value={selectedLanguage}
            onChange={event => setSelectedLanguage(event.target.value)}
            className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold"
          >
            {(session.competition?.languagesAvailable || ["en"]).map(lang => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            className="text-xs font-semibold text-brand"
            onClick={() => setPaletteOpen(true)}
          >
            Palette
          </button>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-brand"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-sm font-semibold">
            Question {currentQuestionIndex + 1}
          </div>
          <div className="mt-4 text-sm">{questionContent.text}</div>
          <div className="mt-6 grid gap-3">
            {options.map((option, index) => {
              const isSelected = answers[currentQuestion._id] === index;
              return (
                <button
                  key={index}
                  onClick={() =>
                    setAnswers(prev => ({ ...prev, [currentQuestion._id]: index }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                    isSelected
                      ? "border-brand bg-brand/10"
                      : "border-border bg-white"
                  }`}
                >
                  {option.text || "Option"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/70 p-4">
          <div className="flex gap-2">
            <button
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
              disabled={currentQuestionIndex === 0}
              onClick={() =>
                setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
              }
            >
              Previous
            </button>
          </div>
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
              onClick={() => handleSubmit(false)}
            >
              Submit challenge
            </button>
          ) : (
            <button
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
              onClick={() =>
                setCurrentQuestionIndex(prev =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
            >
              Next
            </button>
          )}
        </div>
      </div>

      {paletteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Question palette</div>
              <button
                className="text-xs font-semibold text-muted"
                onClick={() => setPaletteOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2 text-xs">
              {questionStatus.map(item => (
                <button
                  key={item.index}
                  onClick={() => {
                    setCurrentQuestionIndex(item.index);
                    setPaletteOpen(false);
                  }}
                  className={`rounded-lg border px-2 py-2 ${
                    item.answered
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-white text-muted"
                  }`}
                >
                  {item.index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
