"use client";

import { useState } from "react";
import { Player } from "@/types/game";
import Button from "./Button";

interface PlayerListProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
}

export default function PlayerList({
  players,
  onAddPlayer,
  onRemovePlayer,
}: PlayerListProps) {
  const [newPlayerName, setNewPlayerName] = useState("");

  const handleAdd = () => {
    const trimmed = newPlayerName.trim();
    if (trimmed) {
      onAddPlayer(trimmed);
      setNewPlayerName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nom du joueur"
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-600"
        />
        <Button onClick={handleAdd} disabled={!newPlayerName.trim()}>
          Ajouter
        </Button>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Aucun joueur. Ajoutez-en pour commencer !
        </p>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {player.name}
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  {player.score} pts
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemovePlayer(player.id)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                aria-label={`Retirer ${player.name}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
