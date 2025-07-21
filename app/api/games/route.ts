import { NextRequest, NextResponse } from 'next/server';
import { getGames, createGame, finishGame, updatePlayerStats } from '@/lib/db/queries';

export async function GET() {
  try {
    const games = await getGames();
    return NextResponse.json(games);
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player1Id, player2Id, boardSize, ruleType } = body;

    // Validate required fields
    if (!player1Id || !player2Id || !boardSize || !ruleType) {
      return NextResponse.json(
        { error: 'Missing required fields: player1Id, player2Id, boardSize, ruleType' },
        { status: 400 }
      );
    }

    if (player1Id === player2Id) {
      return NextResponse.json(
        { error: 'Player1 and Player2 must be different' },
        { status: 400 }
      );
    }

    // Create new game
    const newGame = await createGame({
      player1Id,
      player2Id,
      boardSize,
      ruleType,
      status: 'ongoing',
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error('Failed to create game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      gameId, 
      winnerId, 
      blackScore, 
      whiteScore, 
      gameRecord, 
      duration,
      player1Id,
      player2Id 
    } = body;

    // Validate required fields
    if (!gameId || blackScore === undefined || whiteScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Finish the game
    await finishGame(gameId, winnerId, blackScore, whiteScore, gameRecord);

    // Update player statistics if we have winner and players
    if (winnerId && player1Id && player2Id && duration) {
      // Determine who won and lost
      const loserId = winnerId === player1Id ? player2Id : player1Id;
      
      // Update winner stats
      await updatePlayerStats(winnerId, true, duration);
      
      // Update loser stats
      await updatePlayerStats(loserId, false, duration);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}