import { NextRequest, NextResponse } from 'next/server';
import { getPlayerById, getPlayerStats, deletePlayer, canDeletePlayer } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Invalid player ID' },
        { status: 400 }
      );
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Get detailed stats
    const stats = await getPlayerStats(playerId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Invalid player ID' },
        { status: 400 }
      );
    }

    // Check if player can be deleted and get game count
    const deletionCheck = await canDeletePlayer(playerId);
    
    if (!deletionCheck.canDelete) {
      return NextResponse.json(
        { error: deletionCheck.reason },
        { status: 400 }
      );
    }

    // Perform the deletion
    const result = await deletePlayer(playerId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        gamesDeleted: result.gamesDeleted
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to delete player:', error);
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}