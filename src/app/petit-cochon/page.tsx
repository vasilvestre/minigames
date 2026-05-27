"use client";

import { useState, useEffect, useCallback } from "react";
import { Player, PassThePigsGame, GameRecord } from "@/types/game";
import { saveGame, loadGame, clearGame, saveHistory } from "@/lib/localStorage";
import {
  PigPosition,
  POSITIONS,
  processTurnRoll,
  processBank,
  processPass,
  SpecialRollResult,
} from "@/lib/games/passThePigs";
import PlayerList from "@/components/PlayerList";
import ScoreBoard from "@/components/ScoreBoard";
import Button from "@/components/Button";
import GameHistory from "@/components/GameHistory";

const STORAGE_KEY = "pass-the-pigs-game";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function PassThePigsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnScore, setTurnScore] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);
  const [lastSpecial, setLastSpecial] = useState<SpecialRollResult>(null);
  const [lastRoll, setLastRoll] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayMode, setDisplayMode] = useState<"names" | "icons">("names");

  const saveCurrentState = useCallback(
    (
      newPlayers: Player[],
      newIndex: number,
      newTurnScore: number,
      newWinner: Player | null
    ) => {
      const game: PassThePigsGame = {
        players: newPlayers,
        currentPlayerIndex: newIndex,
        turnScore: newTurnScore,
        winner: newWinner,
        history: [],
      };
      saveGame(STORAGE_KEY, game);
    },
    []
  );

  useEffect(() => {
    const saved = loadGame<PassThePigsGame>(STORAGE_KEY);
    if (saved) {
      requestAnimationFrame(() => {
        setPlayers(saved.players ?? []);
        setCurrentPlayerIndex(saved.currentPlayerIndex ?? 0);
        setTurnScore(saved.turnScore ?? 0);
        setWinner(saved.winner ?? null);
      });
    }
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveCurrentState(players, currentPlayerIndex, turnScore, winner);
    }
  }, [players, currentPlayerIndex, turnScore, winner, isLoaded, saveCurrentState]);

  const handleAddPlayer = useCallback(
    (name: string) => {
      const newPlayer: Player = {
        id: generateId(),
        name: name.trim(),
        score: 0,
      };
      const newPlayers = [...players, newPlayer];
      setPlayers(newPlayers);
      if (players.length === 0) {
        setCurrentPlayerIndex(0);
      }
      setLastSpecial(null);
      setLastRoll(null);
    },
    [players]
  );

  const handleRemovePlayer = useCallback(
    (id: string) => {
      const index = players.findIndex((p) => p.id === id);
      const newPlayers = players.filter((p) => p.id !== id);
      setPlayers(newPlayers);

      if (newPlayers.length === 0) {
        setCurrentPlayerIndex(0);
        setTurnScore(0);
        setWinner(null);
        setLastSpecial(null);
        setLastRoll(null);
        return;
      }

      let newIndex = currentPlayerIndex;
      if (index < currentPlayerIndex) {
        newIndex = Math.max(0, currentPlayerIndex - 1);
      } else if (index === currentPlayerIndex && currentPlayerIndex >= newPlayers.length) {
        newIndex = 0;
      }
      setCurrentPlayerIndex(newIndex);
      setLastSpecial(null);
      setLastRoll(null);
    },
    [players, currentPlayerIndex]
  );

  const handleRoll = useCallback(
    (position: PigPosition) => {
      if (winner || players.length === 0) return;

      const result = processTurnRoll(players, currentPlayerIndex, turnScore, position);
      const positionInfo = POSITIONS.find((p) => p.key === position);
      setLastRoll(positionInfo?.label ?? position);
      setLastSpecial(result.special);
      setPlayers(result.players);
      setCurrentPlayerIndex(result.currentPlayerIndex);
      setTurnScore(result.turnScore);

      if (result.winner) {
        setWinner(result.winner);
        const record: GameRecord = {
          gameType: "pass-the-pigs",
          players: result.players,
          winner: result.winner,
          date: new Date().toISOString(),
        };
        saveHistory(record);
      }
    },
    [players, currentPlayerIndex, turnScore, winner]
  );

  const handleBank = useCallback(() => {
    if (winner || players.length === 0 || turnScore === 0) return;

    const result = processBank(players, currentPlayerIndex, turnScore);
    setPlayers(result.players);
    setCurrentPlayerIndex(result.currentPlayerIndex);
    setTurnScore(result.turnScore);
    setLastSpecial(null);
    setLastRoll(null);

    if (result.winner) {
      setWinner(result.winner);
      const record: GameRecord = {
        gameType: "pass-the-pigs",
        players: result.players,
        winner: result.winner,
        date: new Date().toISOString(),
      };
      saveHistory(record);
    }
  }, [players, currentPlayerIndex, turnScore, winner]);

  const handlePass = useCallback(() => {
    if (winner || players.length === 0) return;

    const result = processPass(players, currentPlayerIndex);
    setCurrentPlayerIndex(result.currentPlayerIndex);
    setTurnScore(result.turnScore);
    setLastSpecial(null);
    setLastRoll(null);
  }, [players, currentPlayerIndex, winner]);

  const handleReset = useCallback(() => {
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setTurnScore(0);
    setWinner(null);
    setLastSpecial(null);
    setLastRoll(null);
    clearGame(STORAGE_KEY);
  }, []);

  const currentPlayer = players[currentPlayerIndex] ?? null;
  const canPlay = players.length > 0 && !winner;

  const regularPositions = POSITIONS.filter((p) => !p.isSpecial);
  const specialPositions = POSITIONS.filter((p) => p.isSpecial);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pass the Pigs
          </h1>
          <p className="mt-2 text-base text-zinc-500 sm:text-lg">
            Jeu du Petit Cochon
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left column: Player management + ScoreBoard */}
          <div className="space-y-6 lg:col-span-1 lg:space-y-8">
            <section>
              <h2 className="mb-3 text-base font-semibold text-foreground sm:mb-4 sm:text-lg">
                Joueurs
              </h2>
              <PlayerList
                players={players}
                onAddPlayer={handleAddPlayer}
                onRemovePlayer={handleRemovePlayer}
              />
            </section>

            <section>
              <ScoreBoard
                players={players}
                currentPlayerIndex={currentPlayerIndex}
                winner={winner}
              />
            </section>
          </div>

          {/* Right column: Game controls */}
          <div className="space-y-6 lg:col-span-2 lg:space-y-8">
            {/* Current turn info */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-foreground sm:text-lg">
                      Tour en cours
                    </h2>
                    <button
                      type="button"
                      onClick={() => setDisplayMode((m) => (m === "names" ? "icons" : "names"))}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                      title={displayMode === "names" ? "Afficher les icônes" : "Afficher les noms"}
                    >
                      {displayMode === "names" ? (
                        <>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                            <path d="M3 15h18" />
                          </svg>
                          Icônes
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 7V4h3" />
                            <path d="M17 4h3v3" />
                            <path d="M4 17v3h3" />
                            <path d="M17 20h3v-3" />
                            <path d="M8 12h8" />
                          </svg>
                          Noms
                        </>
                      )}
                    </button>
                  </div>
                  {currentPlayer && (
                    <p className="mt-1 text-sm text-zinc-500">
                      C&apos;est au tour de{" "}
                      <span className="font-medium text-foreground">
                        {currentPlayer.name}
                      </span>
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-zinc-500">
                    Points du tour
                  </p>
                  <p className="text-2xl font-bold text-foreground sm:text-3xl">
                    {turnScore}
                  </p>
                </div>
              </div>

              {lastRoll && (
                <div className="mb-4 rounded-lg bg-zinc-50 px-4 py-2 text-center text-sm font-medium text-zinc-700">
                  Dernier lancer : {lastRoll}
                </div>
              )}

              {lastSpecial && (
                <div
                  className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
                    lastSpecial.type === "pigOut"
                      ? "bg-amber-50 text-amber-800"
                      : lastSpecial.type === "oinker"
                      ? "bg-red-50 text-red-800"
                      : "bg-zinc-100 text-zinc-800"
                  }`}
                >
                  {lastSpecial.message}
                </div>
              )}

              {winner && (
                <div className="mb-4 rounded-xl bg-zinc-900 px-4 py-4 text-center sm:px-6">
                  <p className="text-sm font-medium text-zinc-300">
                    Partie terminée
                  </p>
                  <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                    {winner.name} a gagné avec {winner.score} points ! 🎉
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-zinc-500">
                    Positions
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {regularPositions.map((pos) => (
                      <button
                        key={pos.key}
                        type="button"
                        onClick={() => handleRoll(pos.key)}
                        disabled={!canPlay}
                        className="min-h-[48px] rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[44px]"
                      >
                        {displayMode === "icons" ? (
                          <span className="flex flex-col items-center">
                            <img src={pos.image} alt={pos.label} className="h-12 w-auto object-contain" />
                            <span className="mt-1 block text-xs text-zinc-500">
                              {pos.points} pts
                            </span>
                          </span>
                        ) : (
                          <>
                            <span className="block">{pos.label}</span>
                            <span className="mt-1 block text-xs text-zinc-500">
                              {pos.points} pts
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-zinc-500">
                    Événements spéciaux
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {specialPositions.map((pos) => (
                      <button
                        key={pos.key}
                        type="button"
                        onClick={() => handleRoll(pos.key)}
                        disabled={!canPlay}
                        className="min-h-[48px] rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[44px]"
                      >
                        {displayMode === "icons" ? (
                          <span className="flex flex-col items-center">
                            <img src={pos.image} alt={pos.label} className="h-12 w-auto object-contain" />
                            <span className="mt-1 block text-xs text-red-600">
                              {pos.key === "pigOut"
                                ? "Perd le tour"
                                : pos.key === "oinker"
                                ? "Perd tout"
                                : "Éliminé"}
                            </span>
                          </span>
                        ) : (
                          <>
                            <span className="block">{pos.label}</span>
                            <span className="mt-1 block text-xs text-red-600">
                              {pos.key === "pigOut"
                                ? "Perd le tour"
                                : pos.key === "oinker"
                                ? "Perd tout"
                                : "Éliminé"}
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  onClick={handleBank}
                  disabled={!canPlay || turnScore === 0}
                  variant="primary"
                >
                  Banque
                </Button>
                <Button
                  onClick={handlePass}
                  disabled={!canPlay}
                  variant="secondary"
                >
                  Passer
                </Button>
                <Button onClick={handleReset} variant="danger">
                  Nouvelle Partie
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Règles
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>
                  Lancez les cochons et accumulez des points selon la position.
                </li>
                <li>
                  Vous pouvez relancer pour accumuler plus de points, mais si
                  vous faites une Cochonnerie, vous perdez les points du tour.
                </li>
                <li>
                  Banque pour sauvegarder vos points du tour dans votre total.
                </li>
                <li>
                  Grogne : vous perdez tous vos points de la partie.
                </li>
                <li>
                  Dos à dos : vous êtes éliminé de la partie.
                </li>
                <li>Le premier joueur à atteindre 100 points gagne.</li>
              </ul>
            </div>

            {/* Game History */}
            <GameHistory gameType="pass-the-pigs" />
          </div>
        </div>
      </div>
  );
}
