import { NextRequest, NextResponse } from 'next/server';
import { GameStatsService } from '@/lib/stats/game-stats';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid player ID' },
        { status: 400 }
      );
    }

    await GameStatsService.updatePlayerStats(id);
    
    return NextResponse.json({ message: 'Player stats updated successfully' });
  } catch (error) {
    console.error('Failed to update player stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}