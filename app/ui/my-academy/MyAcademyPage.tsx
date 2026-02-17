"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getActiveAcademies,
  getMyAcademy,
  getMyAcademyNotifications,
  getMyAcademyQuestionPapers,
  getMyAcademyUpcomingTests,
} from "../../lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

type TabKey = "notifications" | "upcoming" | "papers";

const tabs: { key: TabKey; label: string }[] = [
  { key: "notifications", label: "Notifications" },
  { key: "upcoming", label: "Upcoming Exams" },
  { key: "papers", label: "Practice" },
];

function formatDate(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizePhone(value: string) {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  const justDigits = digits.replace(/[^\d]/g, "");
  if (digits.startsWith("+")) return digits;
  if (justDigits.length === 10) return `+91${justDigits}`;
  if (justDigits.length > 0) return `+${justDigits}`;
  return "";
}

export default function MyAcademyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("notifications");
  const [tabData, setTabData] = useState<{
    notifications: any[];
    upcoming: any[];
    papers: { data: any[]; total: number; page: number; limit: number };
  }>({
    notifications: [],
    upcoming: [],
    papers: { data: [], total: 0, page: 1, limit: 20 },
  });

  const academyQuery = useQuery({
    queryKey: ["my-academy"],
    queryFn: getMyAcademy,
  });

  const academiesQuery = useQuery({
    queryKey: ["active-academies"],
    queryFn: getActiveAcademies,
    enabled: academyQuery.data?.enrolled === false,
  });

  const loadTab = useCallback(async () => {
    if (!academyQuery.data?.enrolled) return;
    if (activeTab === "notifications") {
      const data = await getMyAcademyNotifications();
      setTabData(prev => ({ ...prev, notifications: data || [] }));
    } else if (activeTab === "upcoming") {
      const data = await getMyAcademyUpcomingTests();
      setTabData(prev => ({ ...prev, upcoming: data || [] }));
    } else {
      const data = await getMyAcademyQuestionPapers(1, 20);
      setTabData(prev => ({ ...prev, papers: data || prev.papers }));
    }
  }, [activeTab, academyQuery.data?.enrolled]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  const enrolled = Boolean(academyQuery.data?.enrolled);
  const academy = academyQuery.data?.academy;

  const renderNotEnrolled = useMemo(() => {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <div className="text-lg font-semibold">Join an academy</div>
          <p className="mt-2 text-sm text-muted">
            Browse verified academies and connect to enroll.
          </p>
        </div>
        {academiesQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Loading academies...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(academiesQuery.data || []).map((item: any) => (
              <div
                key={item?._id || item?.id}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="text-sm font-semibold">
                  {item?.name || "Academy"}
                </div>
                {item?.subHeading || item?.description ? (
                  <div className="mt-2 text-xs text-muted">
                    {item?.subHeading || item?.description}
                  </div>
                ) : null}
                {item?.address ? (
                  <div className="mt-2 text-xs text-muted">{item.address}</div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item?.contact ? (
                    <a
                      href={`tel:${normalizePhone(item.contact)}`}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                    >
                      Call
                    </a>
                  ) : null}
                  {item?.whatsapp || item?.contact ? (
                    <a
                      href={`https://wa.me/${normalizePhone(
                        item?.whatsapp || item?.contact
                      ).replace(/[^\d]/g, "")}`}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  {item?.website ? (
                    <a
                      href={
                        /^https?:\/\//i.test(item.website)
                          ? item.website
                          : `https://${item.website}`
                      }
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                    >
                      Website
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [academiesQuery.data, academiesQuery.isLoading]);

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            My Academy
          </p>
          <h1 className="mt-3 font-display text-3xl">
            {academy?.name || "Academy workspace"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Notifications, upcoming tests, and practice papers.
          </p>
        </header>

        {!enrolled ? (
          renderNotEnrolled
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-white/70 p-6">
              <div className="flex flex-wrap gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      activeTab === tab.key
                        ? "bg-brand text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "notifications" ? (
              tabData.notifications.length ? (
                <div className="grid gap-4">
                  {tabData.notifications.map((item: any) => (
                    <div
                      key={item._id || item.id}
                      className="rounded-3xl border border-border bg-card p-5"
                    >
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="mt-2 text-xs text-muted">
                        {item.message}
                      </div>
                      <div className="mt-2 text-xs text-muted">
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
                  No notifications yet.
                </div>
              )
            ) : null}

            {activeTab === "upcoming" ? (
              tabData.upcoming.length ? (
                <div className="grid gap-4">
                  {tabData.upcoming.map((item: any) => {
                    const start = new Date(item.startAt).getTime();
                    const duration =
                      item.durationMinutes || item?.paperId?.exam_due_min || 0;
                    const end = start + duration * 60 * 1000;
                    const now = Date.now();
                    const isLocked = now < start;
                    const isEnded = now > end;
                    const isLive = !isLocked && !isEnded;

                    return (
                      <div
                        key={item._id || item.id}
                        className="rounded-3xl border border-border bg-card p-6"
                      >
                        <div className="text-sm font-semibold">
                          {item.title || item?.paperId?.exam_name}
                        </div>
                        <div className="mt-2 text-xs text-muted">
                          {formatDate(item.startAt)}
                        </div>
                        <div className="mt-2 text-xs text-muted">
                          {duration} mins · 100 questions
                        </div>
                        {isLive ? (
                          <a
                            href={`/question-paper/${item.paperId?._id || item.paperId}?academy=1`}
                            className="mt-4 inline-flex rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
                          >
                            Open test
                          </a>
                        ) : (
                          <div className="mt-4 text-xs text-muted">
                            {isLocked
                              ? `Locked until ${new Date(
                                  item.startAt
                                ).toLocaleDateString()}`
                              : "Test ended"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
                  No upcoming exams.
                </div>
              )
            ) : null}

            {activeTab === "papers" ? (
              tabData.papers?.data?.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {tabData.papers.data.map((item: any) => (
                    <div
                      key={item._id || item.id}
                      className="rounded-3xl border border-border bg-card p-6"
                    >
                      <div className="text-sm font-semibold">
                        {item.exam_name}
                      </div>
                      <div className="mt-2 text-xs text-muted">
                        {item.exam_due_min} mins · {item.total_que_count}{" "}
                        questions
                      </div>
                      <a
                        href={`/question-paper/${item._id}?academy=1`}
                        className="mt-4 inline-flex rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
                      >
                        Open test
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
                  No practice papers available.
                </div>
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
