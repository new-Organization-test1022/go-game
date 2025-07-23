import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { games, players } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    const game = await db
      .select()
      .from(games)
      .leftJoin(players, eq(games.player1Id, players.id))
      .where(eq(games.id, id))
      .limit(1);

    if (game.length === 0) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(game[0]);
  } catch (error) {
    console.error('Failed to get game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const {
      status,
      duration,
      blackScore,
      whiteScore,
      totalMoves,
      blackCapturedStones,
      whiteCapturedStones,
      blackTerritory,
      whiteTerritory,
      endReason,
      record,
      winnerId,
    } = body;

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (status !== undefined) updateData.status = status;
    if (duration !== undefined) updateData.duration = duration;
    if (blackScore !== undefined) updateData.blackScore = blackScore;
    if (whiteScore !== undefined) updateData.whiteScore = whiteScore;
    if (totalMoves !== undefined) updateData.totalMoves = totalMoves;
    if (blackCapturedStones !== undefined) updateData.blackCapturedStones = blackCapturedStones;
    if (whiteCapturedStones !== undefined) updateData.whiteCapturedStones = whiteCapturedStones;
    if (blackTerritory !== undefined) updateData.blackTerritory = blackTerritory;
    if (whiteTerritory !== undefined) updateData.whiteTerritory = whiteTerritory;
    if (endReason !== undefined) updateData.endReason = endReason;
    if (record !== undefined) updateData.record = record;
    if (winnerId !== undefined) updateData.winnerId = winnerId;

    const result = await db
      .update(games)
      .set(updateData)
      .where(eq(games.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(games)
      .where(eq(games.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Failed to delete game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}