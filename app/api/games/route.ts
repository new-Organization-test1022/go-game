import { NextRequest, NextResponse } from 'next/server';
import { getGames, createGame, createAIGame, finishGameWithRanks, updatePlayerStats } from '@/lib/db/queries';
import { updatePlayerRankAfterGame, canPlayerChallenge } from '@/lib/go/rank-service';
import { AIDifficulty } from '@/lib/go/types';

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
    const { player1Id, player2Id, boardSize, ruleType, gameType, aiDifficulty } = body;

    // Validate required fields
    if (!player1Id || !boardSize || !ruleType) {
      return NextResponse.json(
        { error: 'Missing required fields: player1Id, boardSize, ruleType' },
        { status: 400 }
      );
    }

    // Handle different game types
    if (gameType === 'human_vs_ai') {
      // AI game validation
      if (!aiDifficulty) {
        return NextResponse.json(
          { error: 'AI difficulty is required for AI games' },
          { status: 400 }
        );
      }

      // Validate AI difficulty
      if (!Object.values(AIDifficulty).includes(aiDifficulty)) {
        return NextResponse.json(
          { error: 'Invalid AI difficulty level' },
          { status: 400 }
        );
      }

      // Create AI game
      const newGame = await createAIGame({
        player1Id,
        boardSize,
        ruleType,
        gameType: 'human_vs_ai',
        aiDifficulty,
        status: 'ongoing',
      });

      return NextResponse.json(newGame, { status: 201 });
    } else {
      // Human vs human game validation
      if (!player2Id) {
        return NextResponse.json(
          { error: 'Player2 is required for human vs human games' },
          { status: 400 }
        );
      }

      if (player1Id === player2Id) {
        return NextResponse.json(
          { error: 'Player1 and Player2 must be different' },
          { status: 400 }
        );
      }

      // Check if players can challenge each other (rank restriction)
      const challengeCheck = await canPlayerChallenge(player1Id, player2Id);
      if (!challengeCheck.canChallenge) {
        return NextResponse.json(
          { error: challengeCheck.reason },
          { status: 403 }
        );
      }

      // Create human vs human game
      const newGame = await createGame({
        player1Id,
        player2Id,
        boardSize,
        ruleType,
        gameType: 'human_vs_human',
        status: 'ongoing',
      });

      return NextResponse.json(newGame, { status: 201 });
    }
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
      player2Id,
      gameType
    } = body;

    // Validate required fields
    if (!gameId || blackScore === undefined || whiteScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let player1RankBefore: number | undefined;
    let player1RankAfter: number | undefined;
    let player2RankBefore: number | undefined;
    let player2RankAfter: number | undefined;
    let rankUpdateResults: any[] = [];

    // Update ranks and get before/after values
    if (player1Id) {
      const player1Result = await updatePlayerRankAfterGame(
        player1Id, 
        winnerId === player1Id,
        gameType || 'human_vs_human'
      );
      player1RankBefore = player1Result.oldRank.numericValue;
      player1RankAfter = player1Result.newRank.numericValue;
      rankUpdateResults.push({ playerId: player1Id, ...player1Result });
    }

    if (player2Id && gameType !== 'human_vs_ai') {
      const player2Result = await updatePlayerRankAfterGame(
        player2Id, 
        winnerId === player2Id,
        gameType || 'human_vs_human'
      );
      player2RankBefore = player2Result.oldRank.numericValue;
      player2RankAfter = player2Result.newRank.numericValue;
      rankUpdateResults.push({ playerId: player2Id, ...player2Result });
    }

    // Finish the game with rank information
    await finishGameWithRanks(
      gameId, 
      winnerId, 
      blackScore, 
      whiteScore, 
      gameRecord,
      player1RankBefore || 0,
      player1RankAfter || 0,
      player2RankBefore,
      player2RankAfter
    );

    // Update player statistics if we have winner and players
    if (winnerId && player1Id && duration) {
      // Update winner stats
      await updatePlayerStats(winnerId, true, duration);
      
      // Update loser stats for human vs human games
      if (player2Id && gameType !== 'human_vs_ai') {
        const loserId = winnerId === player1Id ? player2Id : player1Id;
        await updatePlayerStats(loserId, false, duration);
      }
    }

    return NextResponse.json({ 
      success: true,
      rankUpdates: rankUpdateResults
    });
  } catch (error) {
    console.error('Failed to update game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}