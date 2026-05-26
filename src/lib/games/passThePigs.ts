import { Player } from "@/types/game";

export type PigPosition =
  | "sider"
  | "trotter"
  | "razorback"
  | "snouter"
  | "leaningJowler"
  | "doubleTrotter"
  | "doubleRazorback"
  | "doubleSnouter"
  | "doubleLeaningJowler"
  | "pigOut"
  | "oinker"
  | "piggyBack";

export interface PositionInfo {
  key: PigPosition;
  label: string;
  points: number;
  isSpecial: boolean;
}

export const POSITIONS: PositionInfo[] = [
  { key: "sider", label: "Sur le côté", points: 1, isSpecial: false },
  { key: "trotter", label: "Pieds", points: 5, isSpecial: false },
  { key: "razorback", label: "Dos", points: 5, isSpecial: false },
  { key: "snouter", label: "Groin", points: 10, isSpecial: false },
  { key: "leaningJowler", label: "Long groin", points: 15, isSpecial: false },
  { key: "doubleTrotter", label: "Double pieds", points: 20, isSpecial: false },
  { key: "doubleRazorback", label: "Double dos", points: 20, isSpecial: false },
  { key: "doubleSnouter", label: "Double groin", points: 40, isSpecial: false },
  { key: "doubleLeaningJowler", label: "Double long groin", points: 60, isSpecial: false },
  { key: "pigOut", label: "Cochonnerie", points: 0, isSpecial: true },
  { key: "oinker", label: "Grogne", points: 0, isSpecial: true },
  { key: "piggyBack", label: "Dos à dos", points: 0, isSpecial: true },
];

export function getPositionInfo(position: PigPosition): PositionInfo | undefined {
  return POSITIONS.find((p) => p.key === position);
}

export function getPositionPoints(position: PigPosition): number {
  return getPositionInfo(position)?.points ?? 0;
}

export function isSpecialRoll(position: PigPosition): boolean {
  return getPositionInfo(position)?.isSpecial ?? false;
}

export type SpecialRollResult =
  | { type: "pigOut"; message: string; loseTurnPoints: true }
  | { type: "oinker"; message: string; loseAllPoints: true }
  | { type: "piggyBack"; message: string; eliminated: true }
  | null;

export function checkSpecialRoll(position: PigPosition): SpecialRollResult {
  switch (position) {
    case "pigOut":
      return {
        type: "pigOut",
        message: "Cochonnerie ! Vous perdez les points du tour.",
        loseTurnPoints: true,
      };
    case "oinker":
      return {
        type: "oinker",
        message: "Grogne ! Vous perdez tous vos points.",
        loseAllPoints: true,
      };
    case "piggyBack":
      return {
        type: "piggyBack",
        message: "Dos à dos ! Vous êtes éliminé.",
        eliminated: true,
      };
    default:
      return null;
  }
}

export interface TurnScoreResult {
  points: number;
  special: SpecialRollResult;
  shouldEndTurn: boolean;
}

export function calculateTurnScore(
  currentTurnScore: number,
  position: PigPosition
): TurnScoreResult {
  const special = checkSpecialRoll(position);

  if (special) {
    switch (special.type) {
      case "pigOut":
        return { points: 0, special, shouldEndTurn: true };
      case "oinker":
        return { points: 0, special, shouldEndTurn: true };
      case "piggyBack":
        return { points: 0, special, shouldEndTurn: true };
    }
  }

  const points = getPositionPoints(position);
  return {
    points: currentTurnScore + points,
    special: null,
    shouldEndTurn: false,
  };
}

export function checkWinCondition(player: Player): boolean {
  return player.score >= 100;
}

export function getWinner(players: Player[]): Player | null {
  return players.find((p) => checkWinCondition(p)) ?? null;
}

export function getNextPlayerIndex(currentIndex: number, playerCount: number): number {
  if (playerCount === 0) return 0;
  return (currentIndex + 1) % playerCount;
}

export function rollRandomPosition(): PigPosition {
  const roll = Math.random();
  if (roll < 0.35) return "sider";
  if (roll < 0.45) return "trotter";
  if (roll < 0.70) return "razorback";
  if (roll < 0.78) return "snouter";
  if (roll < 0.80) return "leaningJowler";
  if (roll < 0.85) return "doubleTrotter";
  if (roll < 0.90) return "doubleRazorback";
  if (roll < 0.93) return "doubleSnouter";
  if (roll < 0.95) return "doubleLeaningJowler";
  if (roll < 0.98) return "pigOut";
  if (roll < 0.99) return "oinker";
  return "piggyBack";
}

export interface RollAction {
  position: PigPosition;
  positionInfo: PositionInfo;
  turnScore: number;
  special: SpecialRollResult;
  shouldEndTurn: boolean;
}

export function executeRoll(currentTurnScore: number, position?: PigPosition): RollAction {
  const rolledPosition = position ?? rollRandomPosition();
  const positionInfo = getPositionInfo(rolledPosition)!;
  const result = calculateTurnScore(currentTurnScore, rolledPosition);

  return {
    position: rolledPosition,
    positionInfo,
    turnScore: result.points,
    special: result.special,
    shouldEndTurn: result.shouldEndTurn,
  };
}

export interface BankResult {
  newScore: number;
  isWinner: boolean;
}

export function bankTurnScore(player: Player, turnScore: number): BankResult {
  const newScore = player.score + turnScore;
  return {
    newScore,
    isWinner: newScore >= 100,
  };
}

export interface ProcessTurnResult {
  players: Player[];
  currentPlayerIndex: number;
  turnScore: number;
  winner: Player | null;
  special: SpecialRollResult;
  eliminatedPlayerId?: string;
}

export function processTurnRoll(
  players: Player[],
  currentPlayerIndex: number,
  currentTurnScore: number,
  position: PigPosition
): ProcessTurnResult {
  const result = calculateTurnScore(currentTurnScore, position);
  const currentPlayer = players[currentPlayerIndex];

  if (result.special) {
    switch (result.special.type) {
      case "pigOut": {
        return {
          players,
          currentPlayerIndex: getNextPlayerIndex(currentPlayerIndex, players.length),
          turnScore: 0,
          winner: null,
          special: result.special,
        };
      }
      case "oinker": {
        const newPlayers = players.map((p, i) =>
          i === currentPlayerIndex ? { ...p, score: 0 } : p
        );
        return {
          players: newPlayers,
          currentPlayerIndex: getNextPlayerIndex(currentPlayerIndex, newPlayers.length),
          turnScore: 0,
          winner: null,
          special: result.special,
        };
      }
      case "piggyBack": {
        const newPlayers = players.filter((_, i) => i !== currentPlayerIndex);
        const nextIndex = currentPlayerIndex % Math.max(1, newPlayers.length);
        return {
          players: newPlayers,
          currentPlayerIndex: newPlayers.length > 0 ? nextIndex : 0,
          turnScore: 0,
          winner: null,
          special: result.special,
          eliminatedPlayerId: currentPlayer?.id,
        };
      }
    }
  }

  return {
    players,
    currentPlayerIndex,
    turnScore: result.points,
    winner: null,
    special: null,
  };
}

export function processBank(
  players: Player[],
  currentPlayerIndex: number,
  turnScore: number
): ProcessTurnResult {
  const currentPlayer = players[currentPlayerIndex];
  const newScore = currentPlayer.score + turnScore;
  const newPlayers = players.map((p, i) =>
    i === currentPlayerIndex ? { ...p, score: newScore } : p
  );

  if (newScore >= 100) {
    return {
      players: newPlayers,
      currentPlayerIndex,
      turnScore: 0,
      winner: newPlayers[currentPlayerIndex],
      special: null,
    };
  }

  return {
    players: newPlayers,
    currentPlayerIndex: getNextPlayerIndex(currentPlayerIndex, newPlayers.length),
    turnScore: 0,
    winner: null,
    special: null,
  };
}

export function processPass(
  players: Player[],
  currentPlayerIndex: number
): ProcessTurnResult {
  return {
    players,
    currentPlayerIndex: getNextPlayerIndex(currentPlayerIndex, players.length),
    turnScore: 0,
    winner: null,
    special: null,
  };
}
