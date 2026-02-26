"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ExamResult,
  MultiLangContent,
  QuestionPaperFull,
  submitPerformanceResult,
  getPaperFullDetails,
  getMyAcademyQuestionPaperById,
} from "../../lib/api";
import { getCustomPaperById } from "../../lib/customPapers";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MathRenderer from "../components/MathRenderer";
import { useLanguage } from "../LanguageContext";

type ResolvedContent = { text: string; image?: string };

const getContent = (
  content: MultiLangContent | undefined,
  lang: string
): ResolvedContent => {
  if (!content) return { text: "" };
  const data = content[lang] || content["en"] || Object.values(content)[0];
  if (!data) return { text: "" };
  return { text: data.text || "", image: data.image_url };
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

export default function QuestionPaperPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const isCustom = searchParams.get("custom") === "1";
  const isAcademy = searchParams.get("academy") === "1";
  const { t } = useLanguage();

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);

  const paperQuery = useQuery({
    queryKey: ["paper", id, isCustom],
    queryFn: async (): Promise<QuestionPaperFull> => {
      if (isCustom) {
        const custom = await getCustomPaperById(id);
        if (!custom) throw new Error("Custom paper not found");
        return custom.generatedPaper;
      }
      if (isAcademy) {
        return getMyAcademyQuestionPaperById(id);
      }
      return getPaperFullDetails(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (paperQuery.data?.supported_languages?.length) {
      setSelectedLanguage(paperQuery.data.supported_languages[0]);
    }
  }, [paperQuery.data]);

  useEffect(() => {
    if (paperQuery.data?.exam_due_min) {
      setTimeLeft(paperQuery.data.exam_due_min * 60);
    }
  }, [paperQuery.data?.exam_due_min]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const allQuestions = useMemo(() => {
    const paper = paperQuery.data;
    if (!paper?.sections) return [];
    return paper.sections.flatMap(section => section.questions || []);
  }, [paperQuery.data]);

  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionIndex];

  const resultMutation = useMutation({
    mutationFn: submitPerformanceResult,
  });

  const calculateAndFinish = async () => {
    const paper = paperQuery.data;
    if (!paper?.sections) return;

    let totalQuestionsCount = 0;
    let answered = 0;
    let correct = 0;
    let incorrect = 0;
    let score = 0;
    let totalMarks = 0;

    const subjectStatsMap: Record<string, { correct: number; total: number }> =
      {};

    let runningIndex = 0;
    paper.sections.forEach(section => {
      const sectionMark = section.marks_per_question || 1;
      const sectionNegative =
        section.negative_marks !== undefined
          ? section.negative_marks
          : paper.has_negative_marking
          ? 0.25
          : 0;

      (section.questions || []).forEach(question => {
        totalQuestionsCount++;
        totalMarks += sectionMark;

        const subject =
          paper.exam_sub && paper.exam_sub[0] ? paper.exam_sub[0] : "General";
        if (!subjectStatsMap[subject]) {
          subjectStatsMap[subject] = { correct: 0, total: 0 };
        }
        subjectStatsMap[subject].total++;

        const userAnswerIndex = answers[runningIndex];
        if (userAnswerIndex !== undefined) {
          answered++;
          const correctAns = question.ans !== undefined ? question.ans : -1;
          const selectedOption = question.options[userAnswerIndex];
          const isCorrect =
            userAnswerIndex === correctAns || selectedOption?.id === correctAns;

          if (isCorrect) {
            correct++;
            score += sectionMark;
            subjectStatsMap[subject].correct++;
          } else {
            incorrect++;
            score -= sectionNegative;
          }
        }
        runningIndex++;
      });
    });

    const unanswered = totalQuestionsCount - answered;
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const accuracy = answered > 0 ? (correct / answered) * 100 : 0;

    const result: ExamResult = {
      totalQuestions: totalQuestionsCount,
      answered,
      correct,
      incorrect,
      unanswered,
      score: Math.max(0, score),
      totalMarks,
      percentage: Math.round(percentage),
      accuracy: Math.round(accuracy),
      timeTaken: (paper.exam_due_min || 60) * 60 - timeLeft,
    };

    const paperType = isCustom
      ? "CUSTOM_PAPER"
      : paper.is_real_exam
      ? "REAL_EXAM"
      : "LATEST_PAPER";

    try {
      await resultMutation.mutateAsync({
        paperId: id,
        paperType,
        score: result.score,
        totalMarks: result.totalMarks,
        correctCount: result.correct,
        wrongCount: result.incorrect,
        totalQuestions: result.totalQuestions,
        timeTaken: result.timeTaken,
        subjectStats: Object.entries(subjectStatsMap).map(
          ([subject, stats]) => ({
            subject,
            correct: stats.correct,
            total: stats.total,
          })
        ),
      });
    } catch {
      // Ignore submission errors; still show result locally
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "qp_last_result",
        JSON.stringify({ result, paper })
      );
    }
    router.replace("/result");
  };

  const paletteQuestions = allQuestions.map((_, index) => {
    let status: "answered" | "marked" | "not_visited" | "visited" =
      "not_visited";
    if (marked.has(index)) status = "marked";
    else if (answers[index] !== undefined) status = "answered";
    else if (index === currentQuestionIndex) status = "visited";
    return { index, status };
  });

  if (paperQuery.isLoading) {
    return (
      <div className="px-6 py-10 text-sm text-muted">{t("exam.loading")}</div>
    );
  }

  const errorStatus = (paperQuery.error as any)?.response?.status;
  if (!paperQuery.data || totalQuestions === 0) {
    return (
      <div className="px-6 py-10 text-sm text-muted">
        {errorStatus === 403 ? (
          <>
            {t("paper.restricted")}{" "}
            <a className="text-brand" href="/subscription">
              {t("paper.upgrade")}
            </a>
          </>
        ) : (
          <>
            {t("exam.notAvailable")}{" "}
            <button className="text-brand" onClick={() => router.back()}>
              {t("exam.goBack")}
            </button>
          </>
        )}
      </div>
    );
  }

  const questionContent = getContent(
    currentQuestion?.que_content,
    selectedLanguage
  );
  const options = (currentQuestion?.options || []).map(option =>
    getContent(option.content, selectedLanguage)
  );

  return (
    <div className="min-h-screen px-6 py-6 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
          <button
            className="text-sm font-semibold text-muted"
            onClick={() => router.back()}
          >
            {t("exam.exit")}
          </button>
          <div className="text-sm font-semibold">
            {paperQuery.data.exam_name}
          </div>
          <div className="text-sm text-muted">
            {currentQuestionIndex + 1}/{totalQuestions}
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white/70 p-4">
          <div className="text-sm font-semibold text-brand">
            {t("exam.timeLeft")}: {formatTime(timeLeft)}
          </div>
          {paperQuery.data.supported_languages?.length > 1 ? (
            <select
              value={selectedLanguage}
              onChange={event => setSelectedLanguage(event.target.value)}
              className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold"
            >
              {paperQuery.data.supported_languages.map(language => (
                <option key={language} value={language}>
                  {language.toUpperCase()}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-brand"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">
              {t("exam.question")} {currentQuestionIndex + 1}
            </div>
            <button
              onClick={() => {
                const next = new Set(marked);
                if (next.has(currentQuestionIndex)) next.delete(currentQuestionIndex);
                else next.add(currentQuestionIndex);
                setMarked(next);
              }}
              className="text-xs font-semibold text-amber-600"
            >
              {marked.has(currentQuestionIndex) ? t("exam.unmark") : t("exam.mark")}
            </button>
          </div>
          <div className="mt-4 text-sm">
            <MathRenderer text={questionContent.text} />
          </div>
          <div className="mt-6 grid gap-3">
            {options.map((option, index) => {
              let status: "default" | "selected" | "marked" = "default";
              const isMarked = marked.has(currentQuestionIndex);
              const isAnswered = answers[currentQuestionIndex] === index;

              if (isAnswered) status = "selected";
              else if (isMarked) status = "marked";

              return (
                <button
                  key={index}
                  onClick={() =>
                    setAnswers(prev => ({
                      ...prev,
                      [currentQuestionIndex]: index,
                    }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                    status === "selected"
                      ? "border-brand bg-brand/10"
                      : "border-border bg-white"
                  }`}
                >
                  <MathRenderer text={option.text || "Option"} />
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
              {t("exam.previous")}
            </button>
            <button
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
              onClick={() => setPaletteOpen(true)}
            >
              {t("exam.palette")}
            </button>
          </div>
          <button
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
            onClick={() => {
              if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                calculateAndFinish();
              }
            }}
          >
            {currentQuestionIndex === totalQuestions - 1 ? t("exam.finish") : t("exam.next")}
          </button>
        </div>
      </div>

      {paletteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-3xl border border-border bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="text-sm font-semibold">{t("exam.palette")}</div>
              <button
                className="text-xs font-semibold text-muted hover:text-foreground"
                onClick={() => setPaletteOpen(false)}
              >
                {t("exam.close")}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 text-xs">
                {paletteQuestions.map(item => (
                  <button
                    key={item.index}
                    onClick={() => {
                      setCurrentQuestionIndex(item.index);
                      setPaletteOpen(false);
                    }}
                    className={`rounded-lg border px-2 py-2.5 transition-colors ${
                      item.status === "answered"
                        ? "border-brand bg-brand/10 text-brand"
                        : item.status === "marked"
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : item.status === "visited"
                        ? "border-slate-300 bg-slate-100 text-slate-700"
                        : "border-border bg-white text-muted hover:bg-slate-50"
                    }`}
                  >
                    {item.index + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
              <div className="text-xs text-muted">
                {t("exam.answered")} {Object.keys(answers).length} / {totalQuestions}
              </div>
              <button
                className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand/90"
                onClick={() => {
                  setPaletteOpen(false);
                  calculateAndFinish();
                }}
              >
                {t("exam.submit")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
