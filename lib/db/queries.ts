import { desc, eq, and, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { players, games, NewPlayer, NewGame, Player, Game } from './schema';

// Player queries
export async function getPlayers(): Promise<Player[]> {
  return await db
    .select()
    .from(players)
    .orderBy(desc(players.winCount));
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

  return {
    ...player,
    totalGames: Number(gameCount[0].count),
    winRate: Math.round(winRate * 100) / 100,
    averageGameTime: player.totalTime > 0 && (player.winCount + player.loseCount) > 0
      ? Math.round(player.totalTime / (player.winCount + player.loseCount))
      : 0,
  };
}