// Chinese Go Rank System Implementation
// 中国围棋段位体系

/**
 * Chinese Go Rank System:
 * 30K -> 1K -> 1段 -> 9段 -> 专业1段 -> 专业9段
 */

export enum RankType {
  KYU = 'kyu',        // 级 (30K-1K)
  AMATEUR_DAN = 'dan', // 业余段 (1段-9段)
  PROFESSIONAL_DAN = 'pro' // 专业段 (专业1段-专业9段)
}

export interface Rank {
  type: RankType;
  level: number;
  displayName: string;
  numericValue: number; // For easy comparison (higher = stronger)
}

/**
 * Rank constants for easy reference
 */
export const RANKS = {
  // Kyu ranks (30K to 1K) - numericValue 1-30
  '30K': { type: RankType.KYU, level: 30, displayName: '30级', numericValue: 1 },
  '29K': { type: RankType.KYU, level: 29, displayName: '29级', numericValue: 2 },
  '28K': { type: RankType.KYU, level: 28, displayName: '28级', numericValue: 3 },
  '27K': { type: RankType.KYU, level: 27, displayName: '27级', numericValue: 4 },
  '26K': { type: RankType.KYU, level: 26, displayName: '26级', numericValue: 5 },
  '25K': { type: RankType.KYU, level: 25, displayName: '25级', numericValue: 6 },
  '24K': { type: RankType.KYU, level: 24, displayName: '24级', numericValue: 7 },
  '23K': { type: RankType.KYU, level: 23, displayName: '23级', numericValue: 8 },
  '22K': { type: RankType.KYU, level: 22, displayName: '22级', numericValue: 9 },
  '21K': { type: RankType.KYU, level: 21, displayName: '21级', numericValue: 10 },
  '20K': { type: RankType.KYU, level: 20, displayName: '20级', numericValue: 11 },
  '19K': { type: RankType.KYU, level: 19, displayName: '19级', numericValue: 12 },
  '18K': { type: RankType.KYU, level: 18, displayName: '18级', numericValue: 13 },
  '17K': { type: RankType.KYU, level: 17, displayName: '17级', numericValue: 14 },
  '16K': { type: RankType.KYU, level: 16, displayName: '16级', numericValue: 15 },
  '15K': { type: RankType.KYU, level: 15, displayName: '15级', numericValue: 16 },
  '14K': { type: RankType.KYU, level: 14, displayName: '14级', numericValue: 17 },
  '13K': { type: RankType.KYU, level: 13, displayName: '13级', numericValue: 18 },
  '12K': { type: RankType.KYU, level: 12, displayName: '12级', numericValue: 19 },
  '11K': { type: RankType.KYU, level: 11, displayName: '11级', numericValue: 20 },
  '10K': { type: RankType.KYU, level: 10, displayName: '10级', numericValue: 21 },
  '9K': { type: RankType.KYU, level: 9, displayName: '9级', numericValue: 22 },
  '8K': { type: RankType.KYU, level: 8, displayName: '8级', numericValue: 23 },
  '7K': { type: RankType.KYU, level: 7, displayName: '7级', numericValue: 24 },
  '6K': { type: RankType.KYU, level: 6, displayName: '6级', numericValue: 25 },
  '5K': { type: RankType.KYU, level: 5, displayName: '5级', numericValue: 26 },
  '4K': { type: RankType.KYU, level: 4, displayName: '4级', numericValue: 27 },
  '3K': { type: RankType.KYU, level: 3, displayName: '3级', numericValue: 28 },
  '2K': { type: RankType.KYU, level: 2, displayName: '2级', numericValue: 29 },
  '1K': { type: RankType.KYU, level: 1, displayName: '1级', numericValue: 30 },
  
  // Amateur Dan ranks (1段 to 9段) - numericValue 31-39
  '1D': { type: RankType.AMATEUR_DAN, level: 1, displayName: '1段', numericValue: 31 },
  '2D': { type: RankType.AMATEUR_DAN, level: 2, displayName: '2段', numericValue: 32 },
  '3D': { type: RankType.AMATEUR_DAN, level: 3, displayName: '3段', numericValue: 33 },
  '4D': { type: RankType.AMATEUR_DAN, level: 4, displayName: '4段', numericValue: 34 },
  '5D': { type: RankType.AMATEUR_DAN, level: 5, displayName: '5段', numericValue: 35 },
  '6D': { type: RankType.AMATEUR_DAN, level: 6, displayName: '6段', numericValue: 36 },
  '7D': { type: RankType.AMATEUR_DAN, level: 7, displayName: '7段', numericValue: 37 },
  '8D': { type: RankType.AMATEUR_DAN, level: 8, displayName: '8段', numericValue: 38 },
  '9D': { type: RankType.AMATEUR_DAN, level: 9, displayName: '9段', numericValue: 39 },
  
  // Professional Dan ranks (专业1段 to 专业9段) - numericValue 40-48
  '1P': { type: RankType.PROFESSIONAL_DAN, level: 1, displayName: '专业1段', numericValue: 40 },
  '2P': { type: RankType.PROFESSIONAL_DAN, level: 2, displayName: '专业2段', numericValue: 41 },
  '3P': { type: RankType.PROFESSIONAL_DAN, level: 3, displayName: '专业3段', numericValue: 42 },
  '4P': { type: RankType.PROFESSIONAL_DAN, level: 4, displayName: '专业4段', numericValue: 43 },
  '5P': { type: RankType.PROFESSIONAL_DAN, level: 5, displayName: '专业5段', numericValue: 44 },
  '6P': { type: RankType.PROFESSIONAL_DAN, level: 6, displayName: '专业6段', numericValue: 45 },
  '7P': { type: RankType.PROFESSIONAL_DAN, level: 7, displayName: '专业7段', numericValue: 46 },
  '8P': { type: RankType.PROFESSIONAL_DAN, level: 8, displayName: '专业8段', numericValue: 47 },
  '9P': { type: RankType.PROFESSIONAL_DAN, level: 9, displayName: '专业9段', numericValue: 48 },
} as const;

// Array of all ranks ordered from weakest to strongest
export const RANK_ORDER = Object.values(RANKS).sort((a, b) => a.numericValue - b.numericValue);

// Default rank for new players
export const DEFAULT_RANK = RANKS['30K'];

/**
 * Utility functions for rank operations
 */

/**
 * Get rank by numeric value
 */
export function getRankByNumericValue(numericValue: number): Rank | null {
  return RANK_ORDER.find(rank => rank.numericValue === numericValue) || null;
}

/**
 * Get next rank (promotion)
 */
export function getNextRank(currentRank: Rank): Rank | null {
  const currentIndex = RANK_ORDER.findIndex(rank => rank.numericValue === currentRank.numericValue);
  if (currentIndex === -1 || currentIndex === RANK_ORDER.length - 1) {
    return null; // Already at highest rank or rank not found
  }
  return RANK_ORDER[currentIndex + 1];
}

/**
 * Get previous rank (demotion)
 */
export function getPreviousRank(currentRank: Rank): Rank | null {
  const currentIndex = RANK_ORDER.findIndex(rank => rank.numericValue === currentRank.numericValue);
  if (currentIndex === -1 || currentIndex === 0) {
    return null; // Already at lowest rank or rank not found
  }
  return RANK_ORDER[currentIndex - 1];
}

/**
 * Check if player can challenge another player based on rank difference
 * Rule: Can only challenge players within +2 ranks
 */
export function canChallenge(challengerRank: Rank, targetRank: Rank): boolean {
  const rankDifference = targetRank.numericValue - challengerRank.numericValue;
  return rankDifference >= -2 && rankDifference <= 2;
}

/**
 * Calculate rank progression based on consecutive wins/losses
 */
export interface RankProgression {
  shouldPromote: boolean;
  shouldSuggestReview: boolean; // For 5 consecutive losses
  message: string;
}

export function calculateRankProgression(
  currentRank: Rank,
  consecutiveWins: number,
  consecutiveLosses: number
): RankProgression {
  // Promotion rule: 5 consecutive wins
  if (consecutiveWins >= 5) {
    const nextRank = getNextRank(currentRank);
    if (nextRank) {
      return {
        shouldPromote: true,
        shouldSuggestReview: false,
        message: `恭喜！连胜5局，从${currentRank.displayName}升级到${nextRank.displayName}！`
      };
    } else {
      return {
        shouldPromote: false,
        shouldSuggestReview: false,
        message: `已达到最高段位${currentRank.displayName}，无法继续升级。`
      };
    }
  }
  
  // Review suggestion: 5 consecutive losses
  if (consecutiveLosses >= 5) {
    return {
      shouldPromote: false,
      shouldSuggestReview: true,
      message: `连败5局，建议复盘总结，提升棋力。`
    };
  }
  
  return {
    shouldPromote: false,
    shouldSuggestReview: false,
    message: ''
  };
}

/**
 * Get rank display string
 */
export function getRankDisplayString(rank: Rank): string {
  return rank.displayName;
}

/**
 * Parse rank from string (e.g., "30K", "1D", "1P")
 */
export function parseRankString(rankString: string): Rank | null {
  return (RANKS as any)[rankString] || null;
}

/**
 * Get all ranks in a specific category
 */
export function getRanksByType(type: RankType): Rank[] {
  return RANK_ORDER.filter(rank => rank.type === type);
}

/**
 * Check if rank is beginner level (20K and below)
 */
export function isBeginnerRank(rank: Rank): boolean {
  return rank.type === RankType.KYU && rank.level >= 20;
}

/**
 * Check if rank is intermediate level (19K to 1D)
 */
export function isIntermediateRank(rank: Rank): boolean {
  return (rank.type === RankType.KYU && rank.level <= 19) || 
         (rank.type === RankType.AMATEUR_DAN && rank.level <= 3);
}

/**
 * Check if rank is advanced level (4D and above)
 */
export function isAdvancedRank(rank: Rank): boolean {
  return (rank.type === RankType.AMATEUR_DAN && rank.level >= 4) || 
         rank.type === RankType.PROFESSIONAL_DAN;
}