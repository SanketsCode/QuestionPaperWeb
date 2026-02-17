import { useQuery } from "@tanstack/react-query";
import { getPaperFullDetails } from "../../lib/api";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "../LanguageContext";

export default function PaperDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { t } = useLanguage();

  const paperQuery = useQuery({
    queryKey: ["paper-details", id],
    queryFn: () => getPaperFullDetails(id),
    enabled: !!id,
  });

  if (paperQuery.isLoading) {
    return (
      <div className="px-6 py-10 text-sm text-muted">{t("common.loading")}</div>
    );
  }

  const errorStatus = (paperQuery.error as any)?.response?.status;
  const paper = paperQuery.data;
  if (!paper) {
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
          t("paper.notFound")
        )}
      </div>
    );
  }

  const instructions = paper.instructions
    ? paper.instructions
        .split("\n")
        .map(item => item.trim().replace(/^[•\-\d]+\.?\s*/, ""))
        .filter(Boolean)
    : (t("paper.defaultInstructions") as string[]);

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {t("paper.instructionTitle")}
          </p>
          <h1 className="mt-3 font-display text-3xl">
            {paper.exam_name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t("paper.subtitle")}
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              {t("paper.duration")}
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.exam_due_min} {t("paper.mins")}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              {t("paper.questions")}
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.total_que_count}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              {t("paper.totalMarks")}
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.total_marks}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              {t("paper.negativeMarking")}
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {paper.has_negative_marking ? "0.25" : "0"}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-sm font-semibold">{t("paper.instructions")}</div>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {instructions.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
            onClick={() => router.back()}
          >
            {t("paper.back")}
          </button>
          <a
            href={`/question-paper/${paper._id}`}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
          >
            {t("paper.startTest")}
          </a>
        </div>
      </div>
    </div>
  );
}
