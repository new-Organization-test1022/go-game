// Core Go game types and interfaces

export enum StoneColor {
  EMPTY = 0,
  BLACK = 1,
  WHITE = 2,
}

export enum GameStatus {
  SETUP = 'setup',
  PLAYING = 'playing',
  FINISHED = 'finished',
  PAUSED = 'paused',
}

export enum BoardSize {
  SMALL = 13,
  LARGE = 19,
}

export enum RuleType {
  CAPTURE = 'capture', // 吃子游戏
  STANDARD = 'standard', // 标准规则
}

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  position: Position;
  color: StoneColor;
  capturedStones: Position[];
  timestamp: number;
}

export interface BoardState {
  size: number; // 13 or 19
  stones: StoneColor[][]; // 2D array representing the board
  capturedBlack: number; // Number of black stones captured
  capturedWhite: number; // Number of white stones captured
}

export interface GameState {
  id?: number;
  boardState: BoardState;
  currentPlayer: StoneColor;
  status: GameStatus;
  ruleType: RuleType;
  moves: Move[];
  player1Id?: number;
  player2Id?: number;
  startTime: number;
  endTime?: number;
  blackScore: number;
  whiteScore: number;
}

export interface Territory {
  positions: Position[];
  owner: StoneColor; // Who controls this territory
  isSecure: boolean; // Whether the territory is secure (surrounded)
}

export interface ScoreInfo {
  blackTerritory: number;
  whiteTerritory: number;
  blackCaptured: number;
  whiteCaptured: number;
  blackTotal: number;
  whiteTotal: number;
  territories: Territory[];
}

// Game types for human vs human or human vs AI
export enum GameType {
  HUMAN_VS_HUMAN = 'human_vs_human',
  HUMAN_VS_AI = 'human_vs_ai',
}

// AI difficulty levels corresponding to Go ranks
export enum AIDifficulty {
  BEGINNER_30K = '30K',
  BEGINNER_25K = '25K',
  BEGINNER_20K = '20K',
  BEGINNER_15K = '15K',
  BEGINNER_10K = '10K',
  BEGINNER_5K = '5K',
  INTERMEDIATE_1K = '1K',
  INTERMEDIATE_1D = '1D',
  INTERMEDIATE_3D = '3D',
  INTERMEDIATE_5D = '5D',
  ADVANCED_7D = '7D',
  ADVANCED_9D = '9D',
  PROFESSIONAL_1P = '1P',
  PROFESSIONAL_3P = '3P',
  PROFESSIONAL_5P = '5P',
  PROFESSIONAL_7P = '7P',
  PROFESSIONAL_9P = '9P',
}