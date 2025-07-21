// Rank Service for handling rank calculations and updates
import { eq } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { players, games } from '../db/schema';
import {
  Rank,
  getRankByNumericValue,
  calculateRankProgression,
  DEFAULT_RANK,
  canChallenge
} from './rank';

export interface RankUpdateResult {
  success: boolean;
  oldRank: Rank;
  newRank: Rank;
  progression: {
    shouldPromote: boolean;
    shouldSuggestReview: boolean;
    message: string;
  };
}

export interface Player {
  id: number;
  nickname: string;
  rank: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  totalGames: number;
  winCount: number;
  loseCount: number;
}

/**
 * Update player rank after a game result
 */
export async function updatePlayerRankAfterGame(
  playerId: number,
  isWinner: boolean,
  gameType: 'human_vs_human' | 'human_vs_ai' = 'human_vs_human'
): Promise<RankUpdateResult> {
  // Get current player data
  const player = await db.select().from(players).where(eq(players.id, playerId)).get();
  
  if (!player) {
    throw new Error(`Player with id ${playerId} not found`);
  }

  const currentRank = getRankByNumericValue(player.rank) || DEFAULT_RANK;
  let newConsecutiveWins = player.consecutiveWins;
  let newConsecutiveLosses = player.consecutiveLosses;
  
  // Update consecutive win/loss counters
  if (isWinner) {
    newConsecutiveWins += 1;
    newConsecutiveLosses = 0; // Reset consecutive losses
  } else {
    newConsecutiveLosses += 1;
    newConsecutiveWins = 0; // Reset consecutive wins
  }

  // Calculate rank progression
  const progression = calculateRankProgression(
    currentRank,
    newConsecutiveWins,
    newConsecutiveLosses
  );

  let newRank = currentRank;
  let shouldUpdateRank = false;

  // Apply rank changes
  if (progression.shouldPromote) {
    const nextRank = getRankByNumericValue(currentRank.numericValue + 1);
    if (nextRank) {
      newRank = nextRank;
      shouldUpdateRank = true;
      // Reset consecutive wins after promotion
      newConsecutiveWins = 0;
    }
  }

  // Update player in database
  const updateData: any = {
    consecutiveWins: newConsecutiveWins,
    consecutiveLosses: newConsecutiveLosses,
    totalGames: player.totalGames + 1,
    winCount: isWinner ? player.winCount + 1 : player.winCount,
    loseCount: isWinner ? player.loseCount : player.loseCount + 1,
    updatedAt: Date.now()
  };

  if (shouldUpdateRank) {
    updateData.rank = newRank.numericValue;
    updateData.lastRankUpdate = Date.now();
  }

  await db.update(players)
    .set(updateData)
    .where(eq(players.id, playerId));

  return {
    success: true,
    oldRank: currentRank,
    newRank: newRank,
    progression: progression
  };
}

/**
 * Check if a player can challenge another player
 */
export async function canPlayerChallenge(challengerId: number, targetId: number): Promise<{
  canChallenge: boolean;
  reason?: string;
  challengerRank: Rank;
  targetRank: Rank;
}> {
  const challenger = await db.select().from(players).where(eq(players.id, challengerId)).get();
  const target = await db.select().from(players).where(eq(players.id, targetId)).get();

  if (!challenger || !target) {
    return {
      canChallenge: false,
      reason: '玩家未找到',
      challengerRank: DEFAULT_RANK,
      targetRank: DEFAULT_RANK
    };
  }

  const challengerRank = getRankByNumericValue(challenger.rank) || DEFAULT_RANK;
  const targetRank = getRankByNumericValue(target.rank) || DEFAULT_RANK;

  const allowed = canChallenge(challengerRank, targetRank);

  return {
    canChallenge: allowed,
    reason: allowed ? undefined : `段位差距过大，只能挑战相差2段以内的对手。你的段位：${challengerRank.displayName}，对手段位：${targetRank.displayName}`,
    challengerRank,
    targetRank
  };
}

/**
 * Get player with rank information
 */
export async function getPlayerWithRank(playerId: number): Promise<(Player & { rankInfo: Rank }) | null> {
  const player = await db.select().from(players).where(eq(players.id, playerId)).get();
  
  if (!player) {
    return null;
  }

  const rankInfo = getRankByNumericValue(player.rank) || DEFAULT_RANK;

  return {
    ...player,
    rankInfo
  };
}

/**
 * Get all players with their rank information, sorted by rank
 */
export async function getAllPlayersWithRanks(): Promise<(Player & { rankInfo: Rank })[]> {
  const allPlayers = await db.select().from(players).orderBy(players.rank);
  
  return allPlayers.map(player => ({
    ...player,
    rankInfo: getRankByNumericValue(player.rank) || DEFAULT_RANK
  }));
}

/**
 * Initialize rank for existing players (migration utility)
 */
export async function initializeRanksForExistingPlayers(): Promise<void> {
  const playersWithoutRank = await db.select()
    .from(players)
    .where(eq(players.rank, 1)); // Default rank

  for (const player of playersWithoutRank) {
    await db.update(players)
      .set({
        rank: DEFAULT_RANK.numericValue,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        totalGames: player.winCount + player.loseCount,
        lastRankUpdate: Date.now(),
        updatedAt: Date.now()
      })
      .where(eq(players.id, player.id));
  }
}

/**
 * Calculate suggested rank based on win/loss ratio (for new implementations)
 */
export function calculateSuggestedRank(winCount: number, loseCount: number): Rank {
  const totalGames = winCount + loseCount;
  
  if (totalGames === 0) {
    return DEFAULT_RANK;
  }

  const winRate = winCount / totalGames;
  
  // Simple rank suggestion based on win rate and total games
  if (totalGames < 10) {
    return DEFAULT_RANK; // Keep beginners at starting rank
  }
  
  let suggestedNumericValue = DEFAULT_RANK.numericValue;
  
  if (winRate >= 0.8 && totalGames >= 20) {
    suggestedNumericValue = Math.min(48, DEFAULT_RANK.numericValue + Math.floor(totalGames / 10));
  } else if (winRate >= 0.6 && totalGames >= 15) {
    suggestedNumericValue = Math.min(35, DEFAULT_RANK.numericValue + Math.floor(totalGames / 15));
  } else if (winRate >= 0.4) {
    suggestedNumericValue = Math.min(30, DEFAULT_RANK.numericValue + Math.floor(totalGames / 20));
  }
  
  return getRankByNumericValue(suggestedNumericValue) || DEFAULT_RANK;
}

/**
 * Simulate rank progression for testing
 */
export function simulateRankProgression(
  currentRank: Rank,
  wins: number,
  losses: number
): { finalRank: Rank; promotions: Rank[]; messages: string[] } {
  let rank = currentRank;
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  const promotions: Rank[] = [];
  const messages: string[] = [];
  
  // Simulate each game result
  for (let i = 0; i < wins; i++) {
    consecutiveWins++;
    consecutiveLosses = 0;
    
    const progression = calculateRankProgression(rank, consecutiveWins, consecutiveLosses);
    if (progression.shouldPromote) {
      const nextRank = getRankByNumericValue(rank.numericValue + 1);
      if (nextRank) {
        promotions.push(nextRank);
        messages.push(progression.message);
        rank = nextRank;
        consecutiveWins = 0; // Reset after promotion
      }
    }
  }
  
  for (let i = 0; i < losses; i++) {
    consecutiveLosses++;
    consecutiveWins = 0;
    
    const progression = calculateRankProgression(rank, consecutiveWins, consecutiveLosses);
    if (progression.shouldSuggestReview) {
      messages.push(progression.message);
      consecutiveLosses = 0; // Reset after review suggestion
    }
  }
  
  return {
    finalRank: rank,
    promotions,
    messages
  };
}