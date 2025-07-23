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
  // Enhanced rule configuration
  captureLimit?: number; // For capture rule: max stones that can be captured
  moveLimit?: number; // For capture rule: max number of moves allowed
  endReason?: string; // How the game ended
  consecutivePasses?: number; // Track consecutive passes for standard rule end
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
// 完整的AI级别对应围棋段位体系
export enum AIDifficulty {
  // 初级AI (30K-10K) - 入门到进阶
  AI_30K = '30K',    // 最初级，刚学会基本规则
  AI_25K = '25K',    // 能独立下棋，常犯基本错误
  AI_20K = '20K',    // 理解提子和气，简单布局
  AI_15K = '15K',    // 初步理解常见布局
  AI_10K = '10K',    // 能主动选择开局方向
  AI_5K = '5K',      // 合理布局和中盘攻击
  
  // 中级AI (1K-3D) - 有一定棋力
  AI_1K = '1K',      // 具备收官计算能力
  AI_1D = '1D',      // 理解复杂定式，会做劫争
  AI_2D = '2D',      // 主动控制大局，攻守平衡
  AI_3D = '3D',      // 具备死活阅读能力
  
  // 高级AI (4D-7D) - 业余高段
  AI_4D = '4D',      // 较强全局观和精确计算
  AI_5D = '5D',      // 准确把握形势判断
  AI_6D = '6D',      // 善于利用厚薄转换
  AI_7D = '7D',      // 精通复杂攻防技巧
  
  // 专业AI (1P-9P) - 职业段位水平
  AI_1P = '1P',      // 深入理解围棋本质
  AI_3P = '3P',      // 超强计算力与形势判断  
  AI_5P = '5P',      // 精通各种复杂棋理
  AI_7P = '7P',      // 能创新布局，对局细腻
  AI_9P = '9P',      // 顶级水平，几乎不犯错
}