import {
  sqliteTable,
  integer,
  text,
  real,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nickname: text('nickname').notNull().unique(),
  winCount: integer('win_count').notNull().default(0),
  loseCount: integer('lose_count').notNull().default(0),
  totalTime: integer('total_time').notNull().default(0), // in seconds
  // Rank system fields
  rank: integer('rank').notNull().default(1), // Numeric rank value (1=30K, 48=9P)
  consecutiveWins: integer('consecutive_wins').notNull().default(0),
  consecutiveLosses: integer('consecutive_losses').notNull().default(0),
  totalGames: integer('total_games').notNull().default(0),
  lastRankUpdate: integer('last_rank_update').$defaultFn(() => Date.now()),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  player1Id: integer('player1_id')
    .notNull()
    .references(() => players.id),
  player2Id: integer('player2_id')
    .references(() => players.id), // Made nullable for AI games
  boardSize: integer('board_size').notNull(), // 13 or 19
  ruleType: text('rule_type').notNull(), // 'capture' or 'standard'
  winnerId: integer('winner_id').references(() => players.id),
  duration: integer('duration').notNull().default(0), // in seconds
  dateTime: integer('date_time').notNull().$defaultFn(() => Date.now()),
  record: text('record'), // JSON string of game moves
  status: text('status').notNull().default('ongoing'), // 'ongoing', 'finished', 'abandoned'
  blackScore: real('black_score').default(0),
  whiteScore: real('white_score').default(0),
  // New fields for rank system and AI battles
  gameType: text('game_type').notNull().default('human_vs_human'), // 'human_vs_human' or 'human_vs_ai'
  aiDifficulty: text('ai_difficulty'), // AI difficulty level (e.g., '30K', '1D', '1P')
  player1RankBefore: integer('player1_rank_before'), // Player's rank before the game
  player1RankAfter: integer('player1_rank_after'), // Player's rank after the game
  player2RankBefore: integer('player2_rank_before'), // Only for human vs human
  player2RankAfter: integer('player2_rank_after'), // Only for human vs human
  // Enhanced statistics fields
  blackCapturedStones: integer('black_captured_stones').default(0),
  whiteCapturedStones: integer('white_captured_stones').default(0),
  blackTerritory: real('black_territory').default(0),
  whiteTerritory: real('white_territory').default(0),
  totalMoves: integer('total_moves').default(0),
  endReason: text('end_reason'), // 'resignation', 'timeout', 'territory_count', 'capture_limit'
  // Rule configuration for capture games
  captureLimit: integer('capture_limit'), // Max captures allowed (for capture rule)
  moveLimit: integer('move_limit'), // Max moves allowed (for capture rule)
  // Additional metadata
  gameNotes: text('game_notes'), // Optional game notes
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

// 游戏移动记录表 - 用于详细棋谱存储和回放
export const gameMoves = sqliteTable('game_moves', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: integer('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  moveNumber: integer('move_number').notNull(), // 手数（从1开始）
  playerId: integer('player_id').references(() => players.id),
  stoneColor: text('stone_color').notNull(), // 'black' or 'white'
  positionX: integer('position_x').notNull(),
  positionY: integer('position_y').notNull(),
  capturedStones: text('captured_stones'), // JSON array of captured stone positions
  timeUsed: integer('time_used').default(0), // 本步用时（秒）
  remainingTime: integer('remaining_time'), // 剩余用时（秒）
  boardStateAfter: text('board_state_after'), // JSON of board state after this move
  comment: text('comment'), // 可选的移动注释
  timestamp: integer('timestamp').notNull().$defaultFn(() => Date.now()),
});

// 玩家详细统计表
export const playerStats = sqliteTable('player_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  // 按规则类型统计
  captureGameWins: integer('capture_game_wins').default(0),
  captureGameLosses: integer('capture_game_losses').default(0),
  standardGameWins: integer('standard_game_wins').default(0),
  standardGameLosses: integer('standard_game_losses').default(0),
  // 按对手类型统计
  humanOpponentWins: integer('human_opponent_wins').default(0),
  humanOpponentLosses: integer('human_opponent_losses').default(0),
  aiOpponentWins: integer('ai_opponent_wins').default(0),
  aiOpponentLosses: integer('ai_opponent_losses').default(0),
  // 详细统计数据
  totalCapturedStones: integer('total_captured_stones').default(0),
  totalLostStones: integer('total_lost_stones').default(0),
  totalTerritory: real('total_territory').default(0),
  averageGameDuration: integer('average_game_duration').default(0), // 平均对局时长（秒）
  longestGame: integer('longest_game').default(0), // 最长对局时长（秒）
  shortestGame: integer('shortest_game'), // 最短对局时长（秒）
  // 段位相关统计
  highestRank: integer('highest_rank').default(1),
  lowestRank: integer('lowest_rank').default(1),
  rankChangeHistory: text('rank_change_history'), // JSON array of rank changes
  // 最近表现
  recentPerformance: text('recent_performance'), // JSON array of last 10 games results
  winStreak: integer('win_streak').default(0),
  loseStreak: integer('lose_streak').default(0),
  bestWinStreak: integer('best_win_streak').default(0),
  // 时间统计
  lastGameDate: integer('last_game_date'),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

// Relations
export const playersRelations = relations(players, ({ many, one }) => ({
  gamesAsPlayer1: many(games, { relationName: 'player1' }),
  gamesAsPlayer2: many(games, { relationName: 'player2' }),
  gamesWon: many(games, { relationName: 'winner' }),
  moves: many(gameMoves),
  stats: one(playerStats, {
    fields: [players.id],
    references: [playerStats.playerId],
  }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  player1: one(players, {
    fields: [games.player1Id],
    references: [players.id],
    relationName: 'player1',
  }),
  player2: one(players, {
    fields: [games.player2Id],
    references: [players.id],
    relationName: 'player2',
  }),
  winner: one(players, {
    fields: [games.winnerId],
    references: [players.id],
    relationName: 'winner',
  }),
  moves: many(gameMoves),
}));

export const gameMovesRelations = relations(gameMoves, ({ one }) => ({
  game: one(games, {
    fields: [gameMoves.gameId],
    references: [games.id],
  }),
  player: one(players, {
    fields: [gameMoves.playerId],
    references: [players.id],
  }),
}));

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  player: one(players, {
    fields: [playerStats.playerId],
    references: [players.id],
  }),
}));

// Type exports
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GameMove = typeof gameMoves.$inferSelect;
export type NewGameMove = typeof gameMoves.$inferInsert;
export type PlayerStats = typeof playerStats.$inferSelect;
export type NewPlayerStats = typeof playerStats.$inferInsert;

export enum BoardSize {
  SMALL = 13,
  LARGE = 19,
}

export enum RuleType {
  CAPTURE = 'capture',
  STANDARD = 'standard',
}

export enum GameStatus {
  ONGOING = 'ongoing',
  FINISHED = 'finished',
  ABANDONED = 'abandoned',
}