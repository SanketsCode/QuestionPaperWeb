"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  LeaderboardEntry,
  getCompetitionById,
  getCompetitionLeaderboard,
} from "../../lib/api";
import { useParams } from "next/navigation";

export default function CompetitionLeaderboardPage() {
  const params = useParams();
  const id = params?.id as string;

  const competitionQuery = useQuery({
    queryKey: ["competition", id],
    queryFn: () => getCompetitionById(id),
    enabled: !!id,
  });

  const leaderboardQuery = useInfiniteQuery({
    queryKey: ["competition-leaderboard", id],
    queryFn: ({ pageParam = 1 }) =>
      getCompetitionLeaderboard(id, pageParam as number, 10),
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!id,
  });

  const rows: LeaderboardEntry[] =
    leaderboardQuery.data?.pages.flatMap(page => page) ?? [];

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Leaderboard
          </p>
          <h1 className="mt-3 font-display text-3xl">
            {competitionQuery.data?.title || "Competition"}
          </h1>
        </header>

        {leaderboardQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Loading leaderboard...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
            Leaderboard will be available after submissions are evaluated.
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border bg-white/80">
            <div className="grid grid-cols-[80px_1fr_120px] gap-2 border-b border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-muted">
              <div>Rank</div>
              <div>Participant</div>
              <div className="text-right">Score</div>
            </div>
            <div className="divide-y divide-border">
              {rows.map(entry => (
                <div
                  key={`${entry.userId}-${entry.rank}`}
                  className="grid grid-cols-[80px_1fr_120px] gap-2 px-6 py-4 text-sm"
                >
                  <div className="font-semibold">#{entry.rank}</div>
                  <div>
                    <div className="font-semibold">{entry.name}</div>
                    <div className="text-xs text-muted">
                      {entry.correctCount ?? 0} correct · {entry.wrongCount ?? 0} wrong
                    </div>
                  </div>
                  <div className="text-right font-semibold">{entry.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {leaderboardQuery.hasNextPage ? (
          <div className="flex justify-center">
            <button
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
              onClick={() => leaderboardQuery.fetchNextPage()}
              disabled={leaderboardQuery.isFetchingNextPage}
            >
              {leaderboardQuery.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
