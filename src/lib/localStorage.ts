import { GameRecord } from '@/types/game';

const HISTORY_KEY = 'minigames_history';

export function saveGame<T>(key: string, game: T): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(game);
    localStorage.setItem(key, serialized);
  } catch {
    // Silently fail on serialization errors
  }
}

export function loadGame<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return null;
    return JSON.parse(serialized) as T;
  } catch {
    return null;
  }
}

export function clearGame(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export function saveHistory(record: GameRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const history = loadHistory();
    history.push(record);
    const serialized = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, serialized);
  } catch {
    // Silently fail on serialization errors
  }
}

export function loadHistory(): GameRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const serialized = localStorage.getItem(HISTORY_KEY);
    if (serialized === null) return [];
    return JSON.parse(serialized) as GameRecord[];
  } catch {
    return [];
  }
}
