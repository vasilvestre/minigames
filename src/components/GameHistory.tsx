"use client";

import { useState, useEffect, useCallback } from "react";
import { GameRecord } from "@/types/game";
import { loadHistory } from "@/lib/localStorage";
import Button from "./Button";

interface GameHistoryProps {
  gameType?: "pass-the-pigs" | "skyjo";
}

const GAME_TYPE_LABELS: Record<string, string> = {
  "pass-the-pigs": "Jeu du Petit Cochon",
  skyjo: "Skyjo",
};

const GAME_TYPE_BADGE_COLORS: Record<string, string> = {
  "pass-the-pigs": "bg-amber-100 text-amber-800",
  skyjo: "bg-blue-100 text-blue-800",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GameHistory({ gameType }: GameHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<GameRecord[]>([]);

  const refreshHistory = useCallback(() => {
    const allHistory = loadHistory();
    const filtered = gameType
      ? allHistory.filter((record) => record.gameType === gameType)
      : allHistory;
    setHistory(filtered.slice(-10));
  }, [gameType]);

  useEffect(() => {
    requestAnimationFrame(() => {
      refreshHistory();
    });
  }, [refreshHistory]);

  const handleClearHistory = useCallback(() => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir effacer tout l'historique ? Cette action est irréversible."
      )
    ) {
      return;
    }

    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("minigames_history");
      setHistory([]);
    } catch {
      // Silently fail
    }
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      refreshHistory();
    }
  }, [isExpanded, refreshHistory]);

  if (history.length === 0 && !isExpanded) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex min-h-[44px] w-full items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Historique des parties
          </h3>
          <span className="text-zinc-400">
            {isExpanded ? "−" : "+"}
          </span>
        </button>
        {isExpanded && (
          <div className="mt-4">
            <p className="text-sm text-zinc-500">
              Aucune partie enregistrée.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <button
        type="button"
        onClick={toggleExpanded}
        className="flex min-h-[44px] w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Historique des parties
          </h3>
          {history.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {history.length}
            </span>
          )}
        </div>
        <span className="text-lg text-zinc-400">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Aucune partie enregistrée.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {history.map((record, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            GAME_TYPE_BADGE_COLORS[record.gameType] ??
                            "bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          {GAME_TYPE_LABELS[record.gameType] ?? record.gameType}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatDate(record.date)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-zinc-600">
                          Gagnant :{" "}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {record.winner.name}
                        </span>
                        <span className="ml-1 text-xs text-zinc-500">
                          ({record.winner.score} pts)
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {record.players.map((player) => (
                        <span
                          key={player.id}
                          className={`rounded-md px-2 py-0.5 text-xs ${
                            player.id === record.winner.id
                              ? "bg-zinc-900 font-medium text-white"
                              : "bg-white text-zinc-600"
                          }`}
                        >
                          {player.name}: {player.score}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleClearHistory}
                  variant="danger"
                  className="w-full sm:w-auto"
                >
                  Effacer l&apos;historique
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
