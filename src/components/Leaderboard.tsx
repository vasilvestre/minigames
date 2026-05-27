"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "./Button";

interface LeaderboardEntry {
  playerName: string;
  wins: number;
}

interface LeaderboardProps {
  gameType?: "pass-the-pigs" | "skyjo";
}

export default function Leaderboard({ gameType }: LeaderboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = gameType
        ? `/api/leaderboard?gameType=${gameType}`
        : "/api/leaderboard";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, [gameType]);

  useEffect(() => {
    if (isExpanded) {
      refreshLeaderboard();
    }
  }, [isExpanded, refreshLeaderboard]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <button
        type="button"
        onClick={toggleExpanded}
        className="flex min-h-[44px] w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Classement
          </h3>
          {leaderboard.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {leaderboard.length} joueurs
            </span>
          )}
        </div>
        <span className="text-lg text-zinc-400">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Chargement...</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Aucune partie enregistrée.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.playerName}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-800"
                          : index === 1
                          ? "bg-zinc-200 text-zinc-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {entry.playerName}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-600">
                    {entry.wins} victoire{entry.wins > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
