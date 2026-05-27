import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameHistory } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');

    let query = db
      .select({
        playerName: sql<string>`${gameHistory.winner}->>'name'`,
        wins: sql<number>`count(*)`,
      })
      .from(gameHistory)
      .groupBy(sql`${gameHistory.winner}->>'name'`)
      .orderBy(sql`count(*) desc`);

    if (gameType) {
      query = query.where(sql`${gameHistory.gameType} = ${gameType}`) as typeof query;
    }

    const leaderboard = await query;

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to load leaderboard' },
      { status: 500 }
    );
  }
}
