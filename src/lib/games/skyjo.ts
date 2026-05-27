export interface SkyjoRound {
  roundNumber: number;
  scores: number[];
  columnElimination: boolean[];
  finisherIndex: number | null;
}

export interface SkyjoPlayer {
  id: string;
  name: string;
}

export interface SkyjoGameState {
  players: SkyjoPlayer[];
  rounds: SkyjoRound[];
  gameEnded: boolean;
  winner: SkyjoPlayer | null;
}

export function calculateTotal(rounds: SkyjoRound[], playerIndex: number): number {
  return rounds.reduce((total, round) => {
    const baseScore = round.scores[playerIndex] ?? 0;
    const isEliminated = round.columnElimination[playerIndex] ?? false;

    if (isEliminated) {
      return total;
    }

    let finalScore = baseScore;
    if (
      round.finisherIndex === playerIndex &&
      baseScore > 0
    ) {
      const roundScores = round.scores.map((s, i) =>
        round.columnElimination[i] ? 0 : (s ?? 0)
      );
      const minScore = Math.min(...roundScores);
      if (baseScore > minScore) {
        finalScore = baseScore * 2;
      }
    }

    return total + finalScore;
  }, 0);
}

export function calculateRoundScore(round: SkyjoRound, playerIndex: number): number {
  const baseScore = round.scores[playerIndex] ?? 0;
  const isEliminated = round.columnElimination[playerIndex] ?? false;

  if (isEliminated) {
    return 0;
  }

  if (
    round.finisherIndex === playerIndex &&
    baseScore > 0
  ) {
    const roundScores = round.scores.map((s, i) =>
      round.columnElimination[i] ? 0 : (s ?? 0)
    );
    const minScore = Math.min(...roundScores);
    if (baseScore > minScore) {
      return baseScore * 2;
    }
  }

  return baseScore;
}

export function calculateAllTotals(rounds: SkyjoRound[], playerCount: number): number[] {
  return Array.from({ length: playerCount }, (_, i) => calculateTotal(rounds, i));
}

export function checkElimination(rounds: SkyjoRound[], playerCount: number): boolean {
  if (rounds.length === 0 || playerCount === 0) return false;
  const totals = calculateAllTotals(rounds, playerCount);
  return totals.some(total => total >= 100);
}

export function checkWinCondition(
  rounds: SkyjoRound[],
  players: SkyjoPlayer[]
): SkyjoPlayer | null {
  if (rounds.length === 0 || players.length === 0) return null;

  const totals = calculateAllTotals(rounds, players.length);
  let minTotal = Infinity;
  let winnerIndex = -1;

  for (let i = 0; i < totals.length; i++) {
    if (totals[i] < minTotal) {
      minTotal = totals[i];
      winnerIndex = i;
    }
  }

  return winnerIndex >= 0 ? players[winnerIndex] : null;
}

export function getRankings(
  rounds: SkyjoRound[],
  players: SkyjoPlayer[]
): { player: SkyjoPlayer; total: number; rank: number }[] {
  if (players.length === 0) return [];

  const totals = calculateAllTotals(rounds, players.length);
  const ranked = players.map((player, index) => ({
    player,
    total: totals[index],
    rank: 0,
  }));

  ranked.sort((a, b) => a.total - b.total);

  let currentRank = 1;
  for (let i = 0; i < ranked.length; i++) {
    if (i > 0 && ranked[i].total !== ranked[i - 1].total) {
      currentRank = i + 1;
    }
    ranked[i].rank = currentRank;
  }

  return ranked;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createEmptyRound(roundNumber: number, playerCount: number): SkyjoRound {
  return {
    roundNumber,
    scores: Array(playerCount).fill(0),
    columnElimination: Array(playerCount).fill(false),
    finisherIndex: null,
  };
}

export function addPlayerToRounds(rounds: SkyjoRound[]): SkyjoRound[] {
  return rounds.map(round => ({
    ...round,
    scores: [...round.scores, 0],
    columnElimination: [...round.columnElimination, false],
  }));
}

export function removePlayerFromRounds(rounds: SkyjoRound[], playerIndex: number): SkyjoRound[] {
  return rounds.map(round => ({
    ...round,
    scores: round.scores.filter((_, i) => i !== playerIndex),
    columnElimination: round.columnElimination.filter((_, i) => i !== playerIndex),
    finisherIndex: round.finisherIndex === playerIndex
      ? null
      : round.finisherIndex !== null && round.finisherIndex > playerIndex
        ? round.finisherIndex - 1
        : round.finisherIndex,
  }));
}

export function toggleColumnElimination(
  rounds: SkyjoRound[],
  roundIndex: number,
  playerIndex: number
): SkyjoRound[] {
  const updated = [...rounds];
  updated[roundIndex] = {
    ...updated[roundIndex],
    columnElimination: [...updated[roundIndex].columnElimination],
  };
  updated[roundIndex].columnElimination[playerIndex] =
    !updated[roundIndex].columnElimination[playerIndex];
  return updated;
}

export function setRoundFinisher(
  rounds: SkyjoRound[],
  roundIndex: number,
  playerIndex: number | null
): SkyjoRound[] {
  const updated = [...rounds];
  updated[roundIndex] = {
    ...updated[roundIndex],
    finisherIndex: playerIndex,
  };
  return updated;
}
