"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNotifications, NotificationItem } from "../../lib/api";

export default function NotificationsPage() {
  const notificationsQuery = useQuery({
    queryKey: ["notifications", 1],
    queryFn: () => getNotifications(1, 20),
  });

  const items: NotificationItem[] = useMemo(() => {
    const data = notificationsQuery.data;
    const list = Array.isArray(data?.data) ? data.data : data?.notifications;
    return Array.isArray(list) ? (list as NotificationItem[]) : [];
  }, [notificationsQuery.data]);

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-3 rounded-[28px] border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Notifications
            </p>
            <h1 className="mt-3 font-display text-3xl">All updates</h1>
          </div>
          <button className="rounded-full border border-border px-4 py-2 text-sm font-semibold">
            Mark all read
          </button>
        </header>

        {notificationsQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Loading notifications...
          </div>
        ) : notificationsQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Failed to load notifications.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
            No notifications yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map(item => (
              <a
                key={item._id}
                href={`/notifications/${item._id}`}
                className="rounded-3xl border border-border bg-card p-5 shadow-[0_18px_45px_rgba(15,118,110,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="mt-2 text-xs text-muted">
                      {item.subtitle || item.message}
                    </div>
                  </div>
                  <div className="text-xs text-muted">
                    {(item.date || item.createdAt) && (
                      <span>
                        {new Date(item.date || item.createdAt || "").toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
