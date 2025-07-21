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
});

export const playersRelations = relations(players, ({ many }) => ({
  gamesAsPlayer1: many(games, { relationName: 'player1' }),
  gamesAsPlayer2: many(games, { relationName: 'player2' }),
  gamesWon: many(games, { relationName: 'winner' }),
}));

export const gamesRelations = relations(games, ({ one }) => ({
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
}));

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

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