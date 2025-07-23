import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { gameMoves } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      gameId,
      moveNumber,
      playerId,
      stoneColor,
      positionX,
      positionY,
      capturedStones,
      timeUsed,
      remainingTime,
      boardStateAfter,
      comment
    } = body;

    // Validate required fields
    if (!gameId || !moveNumber || !stoneColor || positionX === undefined || positionY === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const moveData = {
      gameId,
      moveNumber,
      playerId: playerId || null,
      stoneColor,
      positionX,
      positionY,
      capturedStones: capturedStones || null,
      timeUsed: timeUsed || 0,
      remainingTime: remainingTime || null,
      boardStateAfter: boardStateAfter || null,
      comment: comment || null,
      timestamp: Date.now(),
    };

    const result = await db
      .insert(gameMoves)
      .values(moveData)
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to save move:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    
    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const moves = await db
      .select()
      .from(gameMoves)
      .where(eq(gameMoves.gameId, parseInt(gameId)))
      .orderBy(gameMoves.moveNumber);

    return NextResponse.json(moves);
  } catch (error) {
    console.error('Failed to get moves:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}