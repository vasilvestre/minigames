"use client";

import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/game";
import { saveGame, loadGame, clearGame } from "@/lib/localStorage";
import {
  SkyjoRound,
  SkyjoPlayer,
  calculateTotal,
  calculateRoundScore,
  checkElimination,
  checkWinCondition,
  generateId,
  createEmptyRound,
  addPlayerToRounds,
  removePlayerFromRounds,
  toggleColumnElimination,
  setRoundFinisher,
} from "@/lib/games/skyjo";
import PlayerList from "@/components/PlayerList";
import ScoreBoard from "@/components/ScoreBoard";
import Button from "@/components/Button";
import GameHistory from "@/components/GameHistory";
import Leaderboard from "@/components/Leaderboard";

const SKYJO_STORAGE_KEY = "skyjo_game";

interface SkyjoGameData {
  players: SkyjoPlayer[];
  rounds: SkyjoRound[];
  gameEnded: boolean;
  winner: Player | null;
}

export default function SkyjoPage() {
  const [players, setPlayers] = useState<SkyjoPlayer[]>([]);
  const [rounds, setRounds] = useState<SkyjoRound[]>([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = loadGame<SkyjoGameData>(SKYJO_STORAGE_KEY);
    if (saved) {
      requestAnimationFrame(() => {
        setPlayers(saved.players || []);
        setRounds(saved.rounds || []);
        setGameEnded(saved.gameEnded || false);
        setWinner(saved.winner || null);
      });
    }
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const gameData: SkyjoGameData = {
      players,
      rounds,
      gameEnded,
      winner,
    };
    saveGame(SKYJO_STORAGE_KEY, gameData);
  }, [players, rounds, gameEnded, winner, isLoaded]);

  const handleAddPlayer = useCallback((name: string) => {
    const newPlayer: SkyjoPlayer = {
      id: generateId(),
      name,
    };
    setPlayers((prev) => [...prev, newPlayer]);
    setRounds((prev) => addPlayerToRounds(prev));
  }, []);

  const handleRemovePlayer = useCallback((id: string) => {
    setPlayers((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      if (index === -1) return prev;
      const updated = prev.filter((p) => p.id !== id);

      setRounds((prevRounds) => removePlayerFromRounds(prevRounds, index));

      return updated;
    });
  }, []);

  const handleAddRound = useCallback(() => {
    if (players.length === 0) return;
    const newRound = createEmptyRound(rounds.length + 1, players.length);
    setRounds((prev) => [...prev, newRound]);
  }, [players.length, rounds.length]);

  const handleScoreChange = useCallback(
    (roundIndex: number, playerIndex: number, value: string) => {
      const numValue = value === "" ? 0 : parseInt(value, 10);
      if (isNaN(numValue)) return;

      setRounds((prev) => {
        const updated = [...prev];
        updated[roundIndex] = {
          ...updated[roundIndex],
          scores: [...updated[roundIndex].scores],
        };
        updated[roundIndex].scores[playerIndex] = numValue;
        return updated;
      });
    },
    []
  );

  const handleToggleColumnElimination = useCallback(
    (roundIndex: number, playerIndex: number) => {
      setRounds((prev) => toggleColumnElimination(prev, roundIndex, playerIndex));
    },
    []
  );

  const handleSetFinisher = useCallback(
    (roundIndex: number, playerIndex: number | null) => {
      setRounds((prev) => setRoundFinisher(prev, roundIndex, playerIndex));
    },
    []
  );

  const handleEndGame = useCallback(() => {
    if (rounds.length === 0 || players.length === 0) return;

    const gameWinner = checkWinCondition(rounds, players);
    if (gameWinner) {
      const winnerWithScore: Player = {
        id: gameWinner.id,
        name: gameWinner.name,
        score: calculateTotal(rounds, players.findIndex((p) => p.id === gameWinner.id)),
      };
      setWinner(winnerWithScore);
      setGameEnded(true);

      const updatedPlayers = players.map((player, index) => ({
        id: player.id,
        name: player.name,
        score: calculateTotal(rounds, index),
      }));

      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "skyjo",
          players: updatedPlayers,
          winner: winnerWithScore,
          date: new Date().toISOString(),
        }),
      }).catch((err) => console.error("Failed to save history:", err));
    }
  }, [rounds, players]);

  const handleResetGame = useCallback(() => {
    setPlayers([]);
    setRounds([]);
    setGameEnded(false);
    setWinner(null);
    clearGame(SKYJO_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (gameEnded || rounds.length === 0 || players.length === 0) return;

    const shouldEnd = checkElimination(rounds, players.length);
    if (shouldEnd) {
      requestAnimationFrame(() => {
        handleEndGame();
      });
    }
  }, [rounds, players.length, gameEnded, handleEndGame]);

  const playersWithTotals = players.map((player, index) => ({
    id: player.id,
    name: player.name,
    score: calculateTotal(rounds, index),
  }));

  const canEndGame = rounds.length > 0 && players.length > 0 && !gameEnded;
  const canAddRound = players.length > 0 && !gameEnded;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Skyjo
          </h1>
          <p className="mt-2 text-base text-zinc-600 sm:text-lg">
            Compteur de points
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <h2 className="text-base font-semibold text-foreground mb-3 sm:text-lg sm:mb-4">
                Joueurs
              </h2>
              <PlayerList
                players={playersWithTotals}
                onAddPlayer={handleAddPlayer}
                onRemovePlayer={handleRemovePlayer}
              />
            </div>

            <div className="space-y-3">
              {canAddRound && (
                <Button onClick={handleAddRound} className="w-full">
                  Ajouter une manche
                </Button>
              )}

              {canEndGame && (
                <Button
                  onClick={handleEndGame}
                  variant="secondary"
                  className="w-full"
                >
                  Terminer la partie
                </Button>
              )}

              {(players.length > 0 || rounds.length > 0) && (
                <Button
                  onClick={handleResetGame}
                  variant="danger"
                  className="w-full"
                >
                  Nouvelle Partie
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {gameEnded && winner && (
              <div className="rounded-2xl bg-zinc-900 px-4 py-6 text-center sm:px-6 sm:py-8">
                <p className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
                  Partie terminée
                </p>
                <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {winner.name} gagne ! 🎉
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Score total : {calculateTotal(rounds, players.findIndex((p) => p.id === winner.id))} points
                </p>
              </div>
            )}

            {rounds.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 sm:px-6 sm:py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    Manches
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 sm:px-4 sm:py-3">
                          Manche
                        </th>
                        {players.map((player) => (
                          <th
                            key={player.id}
                            className="px-3 py-2 text-center text-xs font-medium text-zinc-500 sm:px-4 sm:py-3"
                          >
                            {player.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {rounds.map((round, roundIndex) => (
                        <tr key={round.roundNumber}>
                          <td className="px-3 py-2 text-sm font-medium text-zinc-700 sm:px-4 sm:py-3">
                            <div className="flex flex-col gap-1">
                              <span>{round.roundNumber}</span>
                              {!gameEnded && (
                                <select
                                  value={round.finisherIndex ?? ""}
                                  onChange={(e) =>
                                    handleSetFinisher(
                                      roundIndex,
                                      e.target.value === "" ? null : parseInt(e.target.value, 10)
                                    )
                                  }
                                  className="min-h-[44px] text-xs rounded border border-zinc-200 bg-white px-2 py-1 text-zinc-600"
                                >
                                  <option value="">Finisseur</option>
                                  {players.map((p, i) => (
                                    <option key={p.id} value={i}>
                                      {p.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {gameEnded && round.finisherIndex !== null && (
                                <span className="text-xs text-zinc-500">
                                  Fini par : {players[round.finisherIndex]?.name}
                                </span>
                              )}
                            </div>
                          </td>
                          {players.map((player, playerIndex) => {
                            const isEliminated = round.columnElimination[playerIndex] ?? false;
                            const displayScore = calculateRoundScore(round, playerIndex);
                            const isDoubled = displayScore !== (round.scores[playerIndex] ?? 0);

                            return (
                              <td key={player.id} className="px-3 py-2 sm:px-4 sm:py-3">
                                <div className="flex flex-col items-center gap-1">
                                  <input
                                    type="number"
                                    value={isEliminated ? "" : (round.scores[playerIndex] || "")}
                                    onChange={(e) =>
                                      handleScoreChange(
                                        roundIndex,
                                        playerIndex,
                                        e.target.value
                                      )
                                    }
                                    disabled={gameEnded || isEliminated}
                                    className="min-h-[44px] w-16 rounded-lg border border-zinc-200 bg-white px-2 py-2 text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed sm:w-20 sm:px-3"
                                    placeholder="0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleColumnElimination(roundIndex, playerIndex)
                                    }
                                    disabled={gameEnded}
                                    className={`min-h-[44px] min-w-[44px] text-xs px-2 py-1 rounded transition-colors ${
                                      isEliminated
                                        ? "bg-green-100 text-green-700"
                                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title="Élimination de colonne (3 cartes identiques)"
                                  >
                                    {isEliminated ? "Colonne éliminée" : "Élim. colonne"}
                                  </button>
                                  {isDoubled && (
                                    <span className="text-xs text-amber-600 font-medium">
                                      Doublé: {displayScore}
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-zinc-200 bg-zinc-50">
                      <tr>
                        <td className="px-3 py-2 text-sm font-bold text-foreground sm:px-4 sm:py-3">
                          Score total
                        </td>
                        {players.map((_, playerIndex) => (
                          <td
                            key={playerIndex}
                            className="px-3 py-2 text-center text-sm font-bold text-foreground sm:px-4 sm:py-3"
                          >
                            {calculateTotal(rounds, playerIndex)}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {players.length > 0 && (
              <ScoreBoard
                players={playersWithTotals}
                currentPlayerIndex={0}
                winner={winner}
              />
            )}

            {players.length === 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center sm:px-6 sm:py-12">
                <p className="text-sm text-zinc-500">
                  Ajoutez des joueurs pour commencer une partie de Skyjo !
                </p>
              </div>
            )}

            {players.length > 0 && rounds.length === 0 && !gameEnded && (
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center sm:px-6 sm:py-12">
                <p className="text-sm text-zinc-500">
                  Cliquez sur &quot;Ajouter une manche&quot; pour commencer à noter les scores.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Règles
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>
                  Entrez le total des cartes de chaque joueur pour chaque manche (valeurs de -2 à 12).
                </li>
                <li>
                  <strong>Élimination de colonne</strong> : si un joueur a 3 cartes identiques dans une colonne, activez le bouton — son score pour cette manche sera de 0.
                </li>
                <li>
                  <strong>Doublement</strong> : le joueur qui révèle toutes ses cartes en premier (finisseur) voit ses points positifs doublés s&apos;il n&apos;a pas le score le plus bas de la manche.
                </li>
                <li>
                  Sélectionnez le finisseur dans le menu déroulant de chaque manche.
                </li>
                <li>
                  La partie se termine quand un joueur atteint 100 points ou plus. Le gagnant est celui avec le score le plus bas.
                </li>
              </ul>
            </div>

            <GameHistory gameType="skyjo" />

            {/* Leaderboard */}
            <Leaderboard gameType="skyjo" />
          </div>
        </div>
      </div>
  );
}
