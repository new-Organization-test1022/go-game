import { desc, eq, and, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { players, games, NewPlayer, NewGame, Player, Game } from './schema';
import { getRankByNumericValue, DEFAULT_RANK } from '../go/rank';

// Player queries
export async function getPlayers(): Promise<Player[]> {
  return await db
    .select()
    .from(players)
    .orderBy(desc(players.rank)); // Order by rank instead of win count
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const result = await db
    .select()
    .from(players)
    .where(eq(players.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function getPlayerByNickname(nickname: string): Promise<Player | null> {
  const result = await db
    .select()
    .from(players)
    .where(eq(players.nickname, nickname))
    .limit(1);
  
  return result[0] || null;
}

export async function createPlayer(playerData: NewPlayer): Promise<Player> {
  const result = await db
    .insert(players)
    .values({
      ...playerData,
      rank: DEFAULT_RANK.numericValue, // Set default rank for new players
      consecutiveWins: 0,
      consecutiveLosses: 0,
      totalGames: 0,
      lastRankUpdate: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    .returning();
  
  return result[0];
}

export async function updatePlayerStats(
  playerId: number, 
  won: boolean, 
  gameDuration: number
): Promise<void> {
  await db
    .update(players)
    .set({
      winCount: won 
        ? sql`${players.winCount} + 1` 
        : players.winCount,
      loseCount: !won 
        ? sql`${players.loseCount} + 1` 
        : players.loseCount,
      totalTime: sql`${players.totalTime} + ${gameDuration}`,
      updatedAt: Date.now(),
    })
    .where(eq(players.id, playerId));
}

// Game queries
export async function getGames(): Promise<Game[]> {
  return await db
    .select()
    .from(games)
    .orderBy(desc(games.dateTime));
}

export async function getRecentGames(limit: number = 10): Promise<Game[]> {
  return await db
    .select()
    .from(games)
    .orderBy(desc(games.dateTime))
    .limit(limit);
}

export async function getGameById(id: number): Promise<Game | null> {
  const result = await db
    .select()
    .from(games)
    .where(eq(games.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function getGamesByPlayer(playerId: number): Promise<Game[]> {
  return await db
    .select()
    .from(games)
    .where(
      sql`${games.player1Id} = ${playerId} OR ${games.player2Id} = ${playerId}`
    )
    .orderBy(desc(games.dateTime));
}

export async function createGame(gameData: NewGame): Promise<Game> {
  const result = await db
    .insert(games)
    .values({
      ...gameData,
      dateTime: Date.now(),
    })
    .returning();
  
  return result[0];
}

export async function updateGame(
  gameId: number, 
  updates: Partial<Game>
): Promise<void> {
  await db
    .update(games)
    .set(updates)
    .where(eq(games.id, gameId));
}

// Player deletion functions
export async function deletePlayer(playerId: number): Promise<{ success: boolean; gamesDeleted: number; message: string }> {
  try {
    // First, get the player to make sure it exists
    const player = await getPlayerById(playerId);
    if (!player) {
      return {
        success: false,
        gamesDeleted: 0,
        message: 'Player not found'
      };
    }

    // Count games involving this player
    const playerGames = await db
      .select({ count: sql`count(*)` })
      .from(games)
      .where(
        sql`${games.player1Id} = ${playerId} OR ${games.player2Id} = ${playerId}`
      );
    
    const gamesCount = Number(playerGames[0].count);

    // Delete all games involving this player
    await db
      .delete(games)
      .where(
        sql`${games.player1Id} = ${playerId} OR ${games.player2Id} = ${playerId}`
      );

    // Delete the player
    await db
      .delete(players)
      .where(eq(players.id, playerId));

    return {
      success: true,
      gamesDeleted: gamesCount,
      message: `Player "${player.nickname}" and ${gamesCount} related games deleted successfully`
    };
  } catch (error) {
    console.error('Error deleting player:', error);
    return {
      success: false,
      gamesDeleted: 0,
      message: 'Failed to delete player due to database error'
    };
  }
}

export async function canDeletePlayer(playerId: number): Promise<{ canDelete: boolean; reason?: string; gamesCount: number }> {
  try {
    const player = await getPlayerById(playerId);
    if (!player) {
      return {
        canDelete: false,
        reason: 'Player not found',
        gamesCount: 0
      };
    }

    // Count games involving this player
    const playerGames = await db
      .select({ count: sql`count(*)` })
      .from(games)
      .where(
        sql`${games.player1Id} = ${playerId} OR ${games.player2Id} = ${playerId}`
      );
    
    const gamesCount = Number(playerGames[0].count);

    // Allow deletion but warn about consequences
    return {
      canDelete: true,
      gamesCount: gamesCount,
      reason: gamesCount > 0 ? `This will also delete ${gamesCount} game records involving this player` : undefined
    };
  } catch (error) {
    console.error('Error checking player deletion eligibility:', error);
    return {
      canDelete: false,
      reason: 'Database error occurred',
      gamesCount: 0
    };
  }
}

export async function finishGame(
  gameId: number,
  winnerId: number | null,
  blackScore: number,
  whiteScore: number,
  gameRecord: string
): Promise<void> {
  await db
    .update(games)
    .set({
      status: 'finished',
      winnerId,
      blackScore,
      whiteScore,
      record: gameRecord,
    })
    .where(eq(games.id, gameId));
}

// User authentication functions (placeholder for template compatibility)
export async function getUser() {
  // This is a placeholder for template compatibility
  // In a real app, this would return user authentication data
  return null;
}

// Statistics queries
export async function getPlayerStats(playerId: number) {
  const player = await getPlayerById(playerId);
  if (!player) return null;

  const gameCount = await db
    .select({ count: sql`count(*)` })
    .from(games)
    .where(
      sql`${games.player1Id} = ${playerId} OR ${games.player2Id} = ${playerId}`
    );

  const winRate = player.winCount + player.loseCount > 0 
    ? (player.winCount / (player.winCount + player.loseCount)) * 100 
    : 0;

  // Get rank information
  const rankInfo = getRankByNumericValue(player.rank) || DEFAULT_RANK;

  return {
    ...player,
    rankInfo,
    totalGames: Number(gameCount[0].count),
    winRate: Math.round(winRate * 100) / 100,
    averageGameTime: player.totalTime > 0 && (player.winCount + player.loseCount) > 0
      ? Math.round(player.totalTime / (player.winCount + player.loseCount))
      : 0,
  };
}

// Rank-related queries
export async function updatePlayerRank(
  playerId: number,
  newRank: number,
  consecutiveWins: number,
  consecutiveLosses: number,
  totalGames: number
): Promise<void> {
  await db
    .update(players)
    .set({
      rank: newRank,
      consecutiveWins,
      consecutiveLosses,
      totalGames,
      lastRankUpdate: Date.now(),
      updatedAt: Date.now(),
    })
    .where(eq(players.id, playerId));
}

export async function getPlayersWithRanks(): Promise<(Player & { rankInfo: any })[]> {
  const allPlayers = await db
    .select()
    .from(players)
    .orderBy(desc(players.rank));
  
  return allPlayers.map(player => ({
    ...player,
    rankInfo: getRankByNumericValue(player.rank) || DEFAULT_RANK
  }));
}

export async function getPlayersByRankRange(minRank: number, maxRank: number): Promise<Player[]> {
  return await db
    .select()
    .from(players)
    .where(
      and(
        sql`${players.rank} >= ${minRank}`,
        sql`${players.rank} <= ${maxRank}`
      )
    )
    .orderBy(desc(players.rank));
}

// AI Game related queries
export async function createAIGame(gameData: NewGame & { 
  gameType: 'human_vs_ai', 
  aiDifficulty: string 
}): Promise<Game> {
  const result = await db
    .insert(games)
    .values({
      ...gameData,
      player2Id: null, // No player2 for AI games
      dateTime: Date.now(),
    })
    .returning();
  
  return result[0];
}

export async function finishGameWithRanks(
  gameId: number,
  winnerId: number | null,
  blackScore: number,
  whiteScore: number,
  gameRecord: string,
  player1RankBefore: number,
  player1RankAfter: number,
  player2RankBefore?: number,
  player2RankAfter?: number
): Promise<void> {
  await db
    .update(games)
    .set({
      status: 'finished',
      winnerId,
      blackScore,
      whiteScore,
      record: gameRecord,
      player1RankBefore,
      player1RankAfter,
      player2RankBefore,
      player2RankAfter,
    })
    .where(eq(games.id, gameId));
}