/**
 * Skyjo game logic utilities
 *
 * Skyjo scoring rules:
 * - Players input their round totals (sum of card values: -2 to 12)
 * - Column elimination: 3 identical cards in a column = all removed (score 0)
 *   User toggles this per player per round
 * - Doubling: round finisher without lowest score doubles their positive points
 *   User marks who finished the round; if their score isn't lowest, positive points double
 * - When any player reaches 100+ total points, game ends
 * - Winner is the player with the LOWEST total score
 */

export interface SkyjoRound {
  roundNumber: number;
  scores: number[];
  columnElimination: boolean[]; // per player: true = column eliminated, score = 0
  finisherIndex: number | null; // index of player who finished the round
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

/**
 * Calculate total score for a player across all rounds
 * Applies doubling if the player finished the round and didn't have the lowest score
 */
export function calculateTotal(rounds: SkyjoRound[], playerIndex: number): number {
  return rounds.reduce((total, round) => {
    const baseScore = round.scores[playerIndex] ?? 0;
    const isEliminated = round.columnElimination[playerIndex] ?? false;

    if (isEliminated) {
      return total; // column elimination = 0 points
    }

    // Apply doubling if this player finished the round and didn't have the lowest score
    let finalScore = baseScore;
    if (
      round.finisherIndex === playerIndex &&
      baseScore > 0
    ) {
      // Doubling: if finisher doesn't have the lowest score in this round, double positive points
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

/**
 * Calculate the display score for a single round (with doubling applied)
 */
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

/**
 * Calculate totals for all players
 */
export function calculateAllTotals(rounds: SkyjoRound[], playerCount: number): number[] {
  return Array.from({ length: playerCount }, (_, i) => calculateTotal(rounds, i));
}

/**
 * Check if any player has reached 100+ points (elimination threshold)
 */
export function checkElimination(rounds: SkyjoRound[], playerCount: number): boolean {
  if (rounds.length === 0 || playerCount === 0) return false;
  const totals = calculateAllTotals(rounds, playerCount);
  return totals.some(total => total >= 100);
}

/**
 * Find the winner (lowest total score) when game ends
 * Returns null if no rounds played or no players
 */
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

/**
 * Get player totals as an array of { player, total } objects, sorted by total (ascending)
 */
export function getRankings(
  rounds: SkyjoRound[],
  players: SkyjoPlayer[]
): { player: SkyjoPlayer; total: number; rank: number }[] {
  if (players.length === 0) return [];

  const totals = calculateAllTotals(rounds, players.length);
  const ranked = players.map((player, index) => ({
    player,
    total: totals[index],
    rank: 0, // Will be set after sorting
  }));

  // Sort by total ascending (lowest is best in Skyjo)
  ranked.sort((a, b) => a.total - b.total);

  // Assign ranks (handle ties)
  let currentRank = 1;
  for (let i = 0; i < ranked.length; i++) {
    if (i > 0 && ranked[i].total !== ranked[i - 1].total) {
      currentRank = i + 1;
    }
    ranked[i].rank = currentRank;
  }

  return ranked;
}

/**
 * Generate a unique ID for players
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial empty round for given player count
 */
export function createEmptyRound(roundNumber: number, playerCount: number): SkyjoRound {
  return {
    roundNumber,
    scores: Array(playerCount).fill(0),
    columnElimination: Array(playerCount).fill(false),
    finisherIndex: null,
  };
}

/**
 * Add a player to existing rounds (append 0 score to each round)
 */
export function addPlayerToRounds(rounds: SkyjoRound[]): SkyjoRound[] {
  return rounds.map(round => ({
    ...round,
    scores: [...round.scores, 0],
    columnElimination: [...round.columnElimination, false],
  }));
}

/**
 * Remove a player from existing rounds by index
 */
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

/**
 * Toggle column elimination for a player in a round
 */
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

/**
 * Set the round finisher (player who revealed all cards first)
 */
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
