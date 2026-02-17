"use client";

import { useEffect, useMemo, useState } from "react";
import { MultiLangContent, QuestionPaperFull } from "../../lib/api";

type StoredResult = {
  paper: QuestionPaperFull;
};

const getContent = (content: MultiLangContent | undefined, lang: string) => {
  if (!content) return { text: "" };
  const data = content[lang] || content["en"] || Object.values(content)[0];
  return { text: data?.text || "", image: data?.image_url };
};

export default function SolutionPage() {
  const [paper, setPaper] = useState<QuestionPaperFull | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("qp_last_result");
    if (!raw) return;
    const parsed = JSON.parse(raw) as StoredResult;
    setPaper(parsed.paper);
  }, []);

  const supportedLanguages = paper?.supported_languages || ["en"];

  useEffect(() => {
    if (supportedLanguages?.length) {
      setSelectedLanguage(supportedLanguages[0]);
    }
  }, [paper]);

  const questions = useMemo(() => {
    if (!paper?.sections) return [];
    return paper.sections.flatMap(section => section.questions || []);
  }, [paper]);

  if (!paper) {
    return (
      <div className="px-6 py-10 text-sm text-muted">
        No solutions available.{" "}
        <a className="text-brand" href="/results">
          Go to results
        </a>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Solutions
          </p>
          <h1 className="mt-3 font-display text-3xl">
            {paper.exam_name} answers
          </h1>
        </header>

        {supportedLanguages.length > 1 ? (
          <div className="rounded-full border border-border bg-white/70 p-2">
            <select
              value={selectedLanguage}
              onChange={event => setSelectedLanguage(event.target.value)}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold"
            >
              {supportedLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-4">
          {questions.map((q, index) => {
            const questionContent = getContent(q.que_content, selectedLanguage);
            const explanationContent = getContent(
              q.exp_content,
              selectedLanguage
            );
            let correctOption = q.options.find(opt => opt.id === q.ans);
            if (!correctOption && q.ans >= 0 && q.ans < q.options.length) {
              correctOption = q.options[q.ans];
            }
            const correctText = correctOption
              ? getContent(correctOption.content, selectedLanguage).text
              : "N/A";

            return (
              <div
                key={`${q._id || index}`}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {questionContent.text}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                  Correct answer: {correctText}
                </div>

                {explanationContent.text ? (
                  <div className="mt-4 rounded-2xl border border-border bg-white/70 px-4 py-3 text-xs text-muted">
                    {explanationContent.text}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
