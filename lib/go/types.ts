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