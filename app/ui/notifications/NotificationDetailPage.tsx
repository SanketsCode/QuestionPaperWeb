"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotificationDetail } from "../../lib/api";
import { useParams } from "next/navigation";

export default function NotificationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const detailQuery = useQuery({
    queryKey: ["notification-detail", id],
    queryFn: () => getNotificationDetail(id),
    enabled: !!id,
  });

  if (detailQuery.isLoading) {
    return (
      <div className="px-6 py-10 text-sm text-muted">Loading notification...</div>
    );
  }

  if (!detailQuery.data) {
    return (
      <div className="px-6 py-10 text-sm text-muted">Notification not found.</div>
    );
  }

  const item = detailQuery.data;

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Notification
          </p>
          <h1 className="mt-3 font-display text-3xl">{item.title}</h1>
          {item.subtitle ? (
            <p className="mt-2 text-sm text-muted">{item.subtitle}</p>
          ) : null}
        </header>

        <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
          {item.message || "No additional details available."}
        </div>
      </div>
    </div>
  );
}
