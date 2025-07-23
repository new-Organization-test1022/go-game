import { Game, Player, GameMove, PlayerStats } from '@/lib/db/schema';
import { db } from '@/lib/db/drizzle';
import { games, players, gameMoves, playerStats } from '@/lib/db/schema';
import { eq, desc, count, sum, avg, max, min } from 'drizzle-orm';

export interface DetailedGameStats {
  gameId: number;
  player1: Player;
  player2?: Player;
  duration: number;
  totalMoves: number;
  blackCaptured: number;
  whiteCaptured: number;
  blackTerritory: number;
  whiteTerritory: number;
  blackScore: number;
  whiteScore: number;
  winner?: Player;
  ruleType: string;
  gameType: string;
  dateTime: number;
  endReason?: string;
}

export interface PlayerStatsOverview {
  player: Player;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageDuration: number;
  totalCapturedStones: number;
  totalLostStones: number;
  captureGameStats: {
    wins: number;
    losses: number;
    winRate: number;
  };
  standardGameStats: {
    wins: number;
    losses: number;
    winRate: number;
  };
  recentGames: DetailedGameStats[];
}

export class GameStatsService {
  // 获取对局详细统计
  static async getGameStats(gameId: number): Promise<DetailedGameStats | null> {
    const gameData = await db
      .select()
      .from(games)
      .leftJoin(players, eq(games.player1Id, players.id))
      .leftJoin(players, eq(games.player2Id, players.id))
      .leftJoin(players, eq(games.winnerId, players.id))
      .where(eq(games.id, gameId))
      .limit(1);

    if (gameData.length === 0) return null;

    const game = gameData[0].games;
    const player1 = gameData[0].players;
    // Note: This query structure needs adjustment for multiple player joins
    
    return {
      gameId: game.id,
      player1: player1!,
      player2: undefined, // Will need separate query
      duration: game.duration,
      totalMoves: game.totalMoves || 0,
      blackCaptured: game.blackCapturedStones || 0,
      whiteCaptured: game.whiteCapturedStones || 0,
      blackTerritory: game.blackTerritory || 0,
      whiteTerritory: game.whiteTerritory || 0,
      blackScore: game.blackScore || 0,
      whiteScore: game.whiteScore || 0,
      ruleType: game.ruleType,
      gameType: game.gameType,
      dateTime: game.dateTime,
      endReason: game.endReason,
    };
  }

  // 获取玩家统计概览
  static async getPlayerStatsOverview(playerId: number): Promise<PlayerStatsOverview | null> {
    // 获取玩家基本信息
    const player = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (player.length === 0) return null;

    // 获取玩家参与的所有游戏
    const playerGames = await db
      .select()
      .from(games)
      .where(eq(games.player1Id, playerId))
      .union(
        db.select()
          .from(games)
          .where(eq(games.player2Id, playerId))
      )
      .orderBy(desc(games.dateTime));

    // 计算统计数据
    let wins = 0;
    let losses = 0;
    let captureWins = 0;
    let captureLosses = 0;
    let standardWins = 0;
    let standardLosses = 0;
    let totalDuration = 0;
    let totalCaptured = 0;
    let totalLost = 0;

    for (const game of playerGames) {
      totalDuration += game.duration;
      
      const isWinner = game.winnerId === playerId;
      const isPlayer1 = game.player1Id === playerId;
      
      if (isWinner) {
        wins++;
        if (game.ruleType === 'capture') captureWins++;
        else standardWins++;
      } else if (game.winnerId) { // Game finished with a winner
        losses++;
        if (game.ruleType === 'capture') captureLosses++;
        else standardLosses++;
      }

      // Calculate captured/lost stones based on player position
      if (isPlayer1) {
        totalCaptured += game.whiteCapturedStones || 0; // Player1 (black) captured white stones
        totalLost += game.blackCapturedStones || 0; // Player1 (black) lost stones
      } else {
        totalCaptured += game.blackCapturedStones || 0; // Player2 (white) captured black stones
        totalLost += game.whiteCapturedStones || 0; // Player2 (white) lost stones
      }
    }

    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const captureGamesTotal = captureWins + captureLosses;
    const standardGamesTotal = standardWins + standardLosses;

    return {
      player: player[0],
      totalGames,
      wins,
      losses,
      winRate,
      averageDuration: totalGames > 0 ? Math.round(totalDuration / totalGames) : 0,
      totalCapturedStones: totalCaptured,
      totalLostStones: totalLost,
      captureGameStats: {
        wins: captureWins,
        losses: captureLosses,
        winRate: captureGamesTotal > 0 ? (captureWins / captureGamesTotal) * 100 : 0,
      },
      standardGameStats: {
        wins: standardWins,
        losses: standardLosses,
        winRate: standardGamesTotal > 0 ? (standardWins / standardGamesTotal) * 100 : 0,
      },
      recentGames: [], // Will be populated separately
    };
  }

  // 更新玩家统计数据
  static async updatePlayerStats(playerId: number): Promise<void> {
    const overview = await this.getPlayerStatsOverview(playerId);
    if (!overview) return;

    // 检查是否已存在统计记录
    const existingStats = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.playerId, playerId))
      .limit(1);

    const statsData = {
      playerId,
      captureGameWins: overview.captureGameStats.wins,
      captureGameLosses: overview.captureGameStats.losses,
      standardGameWins: overview.standardGameStats.wins,
      standardGameLosses: overview.standardGameStats.losses,
      humanOpponentWins: overview.wins, // Simplified - would need more complex logic
      humanOpponentLosses: overview.losses,
      aiOpponentWins: 0, // To be implemented
      aiOpponentLosses: 0,
      totalCapturedStones: overview.totalCapturedStones,
      totalLostStones: overview.totalLostStones,
      averageGameDuration: overview.averageDuration,
      updatedAt: Date.now(),
    };

    if (existingStats.length > 0) {
      await db
        .update(playerStats)
        .set(statsData)
        .where(eq(playerStats.playerId, playerId));
    } else {
      await db
        .insert(playerStats)
        .values(statsData);
    }
  }

  // 获取最新的对局列表
  static async getRecentGames(limit: number = 10): Promise<DetailedGameStats[]> {
    const recentGames = await db
      .select({
        game: games,
        player1: players,
      })
      .from(games)
      .leftJoin(players, eq(games.player1Id, players.id))
      .orderBy(desc(games.dateTime))
      .limit(limit);

    return recentGames.map(({ game, player1 }) => ({
      gameId: game.id,
      player1: player1!,
      player2: undefined, // Would need separate query
      duration: game.duration,
      totalMoves: game.totalMoves || 0,
      blackCaptured: game.blackCapturedStones || 0,
      whiteCaptured: game.whiteCapturedStones || 0,
      blackTerritory: game.blackTerritory || 0,
      whiteTerritory: game.whiteTerritory || 0,
      blackScore: game.blackScore || 0,
      whiteScore: game.whiteScore || 0,
      ruleType: game.ruleType,
      gameType: game.gameType,
      dateTime: game.dateTime,
      endReason: game.endReason,
    }));
  }

  // 保存游戏移动记录
  static async saveGameMove(
    gameId: number,
    moveNumber: number,
    playerId: number,
    stoneColor: 'black' | 'white',
    positionX: number,
    positionY: number,
    capturedStones: any[] = [],
    timeUsed: number = 0,
    boardState?: any
  ): Promise<void> {
    await db.insert(gameMoves).values({
      gameId,
      moveNumber,
      playerId,
      stoneColor,
      positionX,
      positionY,
      capturedStones: JSON.stringify(capturedStones),
      timeUsed,
      boardStateAfter: boardState ? JSON.stringify(boardState) : null,
      timestamp: Date.now(),
    });
  }

  // 获取游戏的所有移动记录
  static async getGameMoves(gameId: number): Promise<GameMove[]> {
    return await db
      .select()
      .from(gameMoves)
      .where(eq(gameMoves.gameId, gameId))
      .orderBy(gameMoves.moveNumber);
  }

  // 获取全局统计数据
  static async getGlobalStats() {
    const totalGames = await db
      .select({ count: count() })
      .from(games);

    const avgDuration = await db
      .select({ avg: avg(games.duration) })
      .from(games);

    const longestGame = await db
      .select({ max: max(games.duration) })
      .from(games);

    return {
      totalGames: totalGames[0]?.count || 0,
      averageDuration: Math.round(avgDuration[0]?.avg || 0),
      longestGame: longestGame[0]?.max || 0,
    };
  }
}