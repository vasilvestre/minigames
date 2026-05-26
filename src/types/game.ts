export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface PassThePigsGame {
  players: Player[];
  currentPlayerIndex: number;
  turnScore: number;
  winner: Player | null;
  history: GameRecord[];
}

export interface SkyjoGame {
  players: Player[];
  currentRound: number;
  winner: Player | null;
  history: GameRecord[];
}

export interface GameRecord {
  gameType: 'pass-the-pigs' | 'skyjo';
  players: Player[];
  winner: Player;
  date: string;
}
