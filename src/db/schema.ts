import { pgTable, serial, varchar, integer, timestamp, json } from 'drizzle-orm/pg-core';

export const gameHistory = pgTable('game_history', {
  id: serial('id').primaryKey(),
  gameType: varchar('game_type', { length: 50 }).notNull(),
  players: json('players').notNull(),
  winner: json('winner').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type GameHistory = typeof gameHistory.$inferSelect;
export type NewGameHistory = typeof gameHistory.$inferInsert;
