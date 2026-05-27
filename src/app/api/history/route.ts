import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameHistory } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameType, players, winner } = body;

    if (!gameType || !players || !winner) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await db.insert(gameHistory).values({
      gameType,
      players,
      winner,
    }).returning();

    const record = result[0];
    return NextResponse.json({
      ...record,
      date: record.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to save game history:', error);
    return NextResponse.json(
      { error: 'Failed to save game history' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const history = await db.select().from(gameHistory).orderBy(desc(gameHistory.createdAt));
    const formattedHistory = history.map((record) => ({
      ...record,
      date: record.createdAt.toISOString(),
    }));
    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error('Failed to load game history:', error);
    return NextResponse.json(
      { error: 'Failed to load game history' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await db.delete(gameHistory);
    return NextResponse.json({ message: 'History cleared' });
  } catch (error) {
    console.error('Failed to clear game history:', error);
    return NextResponse.json(
      { error: 'Failed to clear game history' },
      { status: 500 }
    );
  }
}
