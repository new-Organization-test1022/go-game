// AI Engine for Go battles with different difficulty levels
import { Position, StoneColor, BoardState, Move } from './types';
import { AIDifficulty } from './types';
import { Rank, parseRankString, isBeginnerRank, isIntermediateRank, isAdvancedRank } from './rank';

export interface AIPlayer {
  difficulty: AIDifficulty;
  rank: Rank | null;
  name: string;
  thinkingTime: number; // milliseconds
}

export interface AIMove {
  position: Position | null; // null means pass
  confidence: number; // 0-1
  reasoning: string;
  thinkingTime: number;
}

/**
 * Create AI player with specified difficulty
 */
export function createAIPlayer(difficulty: AIDifficulty): AIPlayer {
  const rank = parseRankString(difficulty);
  const name = `AI ${difficulty}`;
  
  // Thinking time based on difficulty
  let thinkingTime = 1000; // Default 1 second
  if (rank) {
    if (isBeginnerRank(rank)) {
      thinkingTime = 500; // Beginner AI thinks quickly
    } else if (isIntermediateRank(rank)) {
      thinkingTime = 1500; // Intermediate AI thinks moderately
    } else if (isAdvancedRank(rank)) {
      thinkingTime = 3000; // Advanced AI thinks longer
    }
  }

  return {
    difficulty,
    rank,
    name,
    thinkingTime
  };
}

/**
 * Get AI move based on difficulty level
 */
export async function getAIMove(
  boardState: BoardState,
  aiPlayer: AIPlayer,
  aiColor: StoneColor,
  moveHistory: Move[] = []
): Promise<AIMove> {
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, aiPlayer.thinkingTime));

  const difficulty = aiPlayer.difficulty;
  
  // Different AI strategies based on difficulty
  if (isBeginnerAI(difficulty)) {
    return getBeginnerMove(boardState, aiColor);
  } else if (isIntermediateAI(difficulty)) {
    return getIntermediateMove(boardState, aiColor, moveHistory);
  } else {
    return getAdvancedMove(boardState, aiColor, moveHistory);
  }
}

/**
 * Check if AI difficulty is beginner level
 */
function isBeginnerAI(difficulty: AIDifficulty): boolean {
  const beginnerLevels = [
    AIDifficulty.BEGINNER_30K,
    AIDifficulty.BEGINNER_25K,
    AIDifficulty.BEGINNER_20K,
    AIDifficulty.BEGINNER_15K,
    AIDifficulty.BEGINNER_10K,
    AIDifficulty.BEGINNER_5K
  ];
  return beginnerLevels.includes(difficulty);
}

/**
 * Check if AI difficulty is intermediate level
 */
function isIntermediateAI(difficulty: AIDifficulty): boolean {
  const intermediateLevels = [
    AIDifficulty.INTERMEDIATE_1K,
    AIDifficulty.INTERMEDIATE_1D,
    AIDifficulty.INTERMEDIATE_3D,
    AIDifficulty.INTERMEDIATE_5D
  ];
  return intermediateLevels.includes(difficulty);
}

/**
 * Beginner AI - Simple random moves with basic rules
 */
function getBeginnerMove(boardState: BoardState, aiColor: StoneColor): AIMove {
  const validMoves = getValidMoves(boardState, aiColor);
  
  if (validMoves.length === 0) {
    return {
      position: null, // Pass
      confidence: 0.1,
      reasoning: "No valid moves available",
      thinkingTime: 500
    };
  }

  // Beginner AI makes somewhat random moves with slight preference for center
  const centerWeight = 0.3;
  const center = Math.floor(boardState.size / 2);
  
  let selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)];
  
  // Sometimes prefer center area
  if (Math.random() < centerWeight) {
    const centerMoves = validMoves.filter(pos => 
      Math.abs(pos.x - center) <= 2 && Math.abs(pos.y - center) <= 2
    );
    if (centerMoves.length > 0) {
      selectedMove = centerMoves[Math.floor(Math.random() * centerMoves.length)];
    }
  }

  return {
    position: selectedMove,
    confidence: 0.3 + Math.random() * 0.3, // 0.3-0.6
    reasoning: "Random move with slight center preference",
    thinkingTime: 500
  };
}

/**
 * Intermediate AI - Pattern recognition and basic strategy
 */
function getIntermediateMove(
  boardState: BoardState,
  aiColor: StoneColor,
  moveHistory: Move[]
): AIMove {
  const validMoves = getValidMoves(boardState, aiColor);
  
  if (validMoves.length === 0) {
    return {
      position: null,
      confidence: 0.2,
      reasoning: "No valid moves available",
      thinkingTime: 1500
    };
  }

  // Intermediate AI considers:
  // 1. Capture opportunities
  // 2. Defense against captures
  // 3. Pattern formation
  // 4. Territory building

  const captureMove = findCaptureMove(boardState, aiColor);
  if (captureMove) {
    return {
      position: captureMove,
      confidence: 0.8,
      reasoning: "Capturing opponent stones",
      thinkingTime: 1500
    };
  }

  const defenseMove = findDefenseMove(boardState, aiColor);
  if (defenseMove) {
    return {
      position: defenseMove,
      confidence: 0.7,
      reasoning: "Defending against capture",
      thinkingTime: 1500
    };
  }

  // Pattern-based move
  const patternMove = findPatternMove(boardState, aiColor);
  if (patternMove) {
    return {
      position: patternMove,
      confidence: 0.6,
      reasoning: "Pattern-based strategic move",
      thinkingTime: 1500
    };
  }

  // Fallback to good positional play
  const positionalMove = findPositionalMove(boardState, aiColor);
  return {
    position: positionalMove,
    confidence: 0.5,
    reasoning: "Positional play",
    thinkingTime: 1500
  };
}

/**
 * Advanced AI - Deep strategy and tactical calculation
 */
function getAdvancedMove(
  boardState: BoardState,
  aiColor: StoneColor,
  moveHistory: Move[]
): AIMove {
  const validMoves = getValidMoves(boardState, aiColor);
  
  if (validMoves.length === 0) {
    return {
      position: null,
      confidence: 0.3,
      reasoning: "No valid moves available",
      thinkingTime: 3000
    };
  }

  // Advanced AI considers:
  // 1. Multi-step tactical sequences
  // 2. Global strategy
  // 3. Life and death situations
  // 4. Endgame calculations

  const tacticalMove = findTacticalSequence(boardState, aiColor, moveHistory);
  if (tacticalMove) {
    return {
      position: tacticalMove,
      confidence: 0.9,
      reasoning: "Calculated tactical sequence",
      thinkingTime: 3000
    };
  }

  const strategicMove = findStrategicMove(boardState, aiColor, moveHistory);
  if (strategicMove) {
    return {
      position: strategicMove,
      confidence: 0.8,
      reasoning: "Strategic global play",
      thinkingTime: 3000
    };
  }

  // High-level positional play
  const advancedPositional = findAdvancedPositionalMove(boardState, aiColor);
  return {
    position: advancedPositional,
    confidence: 0.7,
    reasoning: "Advanced positional judgment",
    thinkingTime: 3000
  };
}

/**
 * Get all valid moves on the board
 */
function getValidMoves(boardState: BoardState, color: StoneColor): Position[] {
  const validMoves: Position[] = [];
  
  for (let x = 0; x < boardState.size; x++) {
    for (let y = 0; y < boardState.size; y++) {
      if (boardState.stones[x][y] === StoneColor.EMPTY) {
        // Simple validation - in a real implementation, you'd check for:
        // - Ko rule violations
        // - Suicide moves (unless they capture)
        validMoves.push({ x, y });
      }
    }
  }
  
  return validMoves;
}

/**
 * Find move that captures opponent stones
 */
function findCaptureMove(boardState: BoardState, aiColor: StoneColor): Position | null {
  const opponentColor = aiColor === StoneColor.BLACK ? StoneColor.WHITE : StoneColor.BLACK;
  const validMoves = getValidMoves(boardState, aiColor);
  
  // Look for moves that would capture opponent stones
  for (const move of validMoves) {
    // Check adjacent opponent groups for capture opportunities
    const adjacentPositions = getAdjacentPositions(move, boardState.size);
    
    for (const adjPos of adjacentPositions) {
      if (boardState.stones[adjPos.x][adjPos.y] === opponentColor) {
        // Check if this opponent group would be captured
        const groupLiberties = countLiberties(boardState, adjPos, opponentColor);
        if (groupLiberties === 1) {
          return move; // This move would capture the group
        }
      }
    }
  }
  
  return null;
}

/**
 * Find move that defends against capture
 */
function findDefenseMove(boardState: BoardState, aiColor: StoneColor): Position | null {
  const validMoves = getValidMoves(boardState, aiColor);
  
  // Look for own groups in danger
  for (let x = 0; x < boardState.size; x++) {
    for (let y = 0; y < boardState.size; y++) {
      if (boardState.stones[x][y] === aiColor) {
        const liberties = countLiberties(boardState, { x, y }, aiColor);
        if (liberties === 1) {
          // This group is in atari - try to save it
          const escapeMove = findEscapeMove(boardState, { x, y }, aiColor);
          if (escapeMove && validMoves.some(m => m.x === escapeMove.x && m.y === escapeMove.y)) {
            return escapeMove;
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * Find pattern-based strategic move
 */
function findPatternMove(boardState: BoardState, aiColor: StoneColor): Position | null {
  const validMoves = getValidMoves(boardState, aiColor);
  
  // Simple pattern: extend from existing stones
  for (const move of validMoves) {
    const adjacentPositions = getAdjacentPositions(move, boardState.size);
    const hasAdjacentFriendly = adjacentPositions.some(pos => 
      boardState.stones[pos.x][pos.y] === aiColor
    );
    
    if (hasAdjacentFriendly) {
      return move; // Extend from existing stones
    }
  }
  
  return null;
}

/**
 * Find good positional move
 */
function findPositionalMove(boardState: BoardState, aiColor: StoneColor): Position {
  const validMoves = getValidMoves(boardState, aiColor);
  
  // Prefer moves closer to the center in early game
  const center = Math.floor(boardState.size / 2);
  
  let bestMove = validMoves[0];
  let bestScore = -1;
  
  for (const move of validMoves) {
    let score = 0;
    
    // Distance from center (closer is better in early game)
    const distanceFromCenter = Math.abs(move.x - center) + Math.abs(move.y - center);
    score += (boardState.size - distanceFromCenter) * 0.1;
    
    // Avoid edges in early game
    const distanceFromEdge = Math.min(move.x, move.y, boardState.size - 1 - move.x, boardState.size - 1 - move.y);
    score += distanceFromEdge * 0.2;
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

/**
 * Find tactical sequence (advanced AI)
 */
function findTacticalSequence(
  boardState: BoardState,
  aiColor: StoneColor,
  moveHistory: Move[]
): Position | null {
  // Simplified tactical analysis
  // In a real implementation, this would use more sophisticated algorithms
  
  // First check for immediate captures
  const captureMove = findCaptureMove(boardState, aiColor);
  if (captureMove) return captureMove;
  
  // Then check for defense
  const defenseMove = findDefenseMove(boardState, aiColor);
  if (defenseMove) return defenseMove;
  
  return null;
}

/**
 * Find strategic move considering global position
 */
function findStrategicMove(
  boardState: BoardState,
  aiColor: StoneColor,
  moveHistory: Move[]
): Position | null {
  // Simplified strategic analysis
  // Consider territory, influence, group strength
  
  const validMoves = getValidMoves(boardState, aiColor);
  
  // Look for moves that build territory or reduce opponent territory
  let bestMove = null;
  let bestValue = -1;
  
  for (const move of validMoves) {
    let value = 0;
    
    // Evaluate territorial potential
    value += evaluateTerritorialValue(boardState, move, aiColor);
    
    // Evaluate influence
    value += evaluateInfluence(boardState, move, aiColor);
    
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  
  return bestMove;
}

/**
 * Find advanced positional move
 */
function findAdvancedPositionalMove(boardState: BoardState, aiColor: StoneColor): Position {
  const validMoves = getValidMoves(boardState, aiColor);
  
  // Advanced positional evaluation
  let bestMove = validMoves[0];
  let bestScore = -1000;
  
  for (const move of validMoves) {
    let score = 0;
    
    // Multiple criteria evaluation
    score += evaluateInfluence(boardState, move, aiColor) * 2;
    score += evaluateTerritorialValue(boardState, move, aiColor) * 3;
    score += evaluateGroupConnection(boardState, move, aiColor) * 1.5;
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

/**
 * Utility functions
 */

function getAdjacentPositions(pos: Position, boardSize: number): Position[] {
  const adjacent: Position[] = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (const [dx, dy] of directions) {
    const newX = pos.x + dx;
    const newY = pos.y + dy;
    
    if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
      adjacent.push({ x: newX, y: newY });
    }
  }
  
  return adjacent;
}

function countLiberties(boardState: BoardState, pos: Position, color: StoneColor): number {
  const visited = new Set<string>();
  const group: Position[] = [];
  
  // Find the group
  findGroup(boardState, pos, color, group, visited);
  
  // Count liberties of the group
  const liberties = new Set<string>();
  
  for (const groupPos of group) {
    const adjacent = getAdjacentPositions(groupPos, boardState.size);
    for (const adjPos of adjacent) {
      if (boardState.stones[adjPos.x][adjPos.y] === StoneColor.EMPTY) {
        liberties.add(`${adjPos.x},${adjPos.y}`);
      }
    }
  }
  
  return liberties.size;
}

function findGroup(
  boardState: BoardState,
  pos: Position,
  color: StoneColor,
  group: Position[],
  visited: Set<string>
): void {
  const key = `${pos.x},${pos.y}`;
  if (visited.has(key) || boardState.stones[pos.x][pos.y] !== color) {
    return;
  }
  
  visited.add(key);
  group.push(pos);
  
  const adjacent = getAdjacentPositions(pos, boardState.size);
  for (const adjPos of adjacent) {
    findGroup(boardState, adjPos, color, group, visited);
  }
}

function findEscapeMove(boardState: BoardState, pos: Position, color: StoneColor): Position | null {
  const adjacent = getAdjacentPositions(pos, boardState.size);
  
  for (const adjPos of adjacent) {
    if (boardState.stones[adjPos.x][adjPos.y] === StoneColor.EMPTY) {
      return adjPos; // Simple escape - play adjacent empty point
    }
  }
  
  return null;
}

function evaluateTerritorialValue(boardState: BoardState, move: Position, color: StoneColor): number {
  // Simplified territorial evaluation
  let value = 0;
  
  // Count empty points influenced by this move
  const influenceRadius = 2;
  for (let dx = -influenceRadius; dx <= influenceRadius; dx++) {
    for (let dy = -influenceRadius; dy <= influenceRadius; dy++) {
      const x = move.x + dx;
      const y = move.y + dy;
      
      if (x >= 0 && x < boardState.size && y >= 0 && y < boardState.size) {
        if (boardState.stones[x][y] === StoneColor.EMPTY) {
          const distance = Math.abs(dx) + Math.abs(dy);
          value += (influenceRadius - distance) * 0.1;
        }
      }
    }
  }
  
  return value;
}

function evaluateInfluence(boardState: BoardState, move: Position, color: StoneColor): number {
  // Simplified influence evaluation
  let influence = 0;
  
  // Count friendly stones nearby
  const checkRadius = 3;
  for (let dx = -checkRadius; dx <= checkRadius; dx++) {
    for (let dy = -checkRadius; dy <= checkRadius; dy++) {
      const x = move.x + dx;
      const y = move.y + dy;
      
      if (x >= 0 && x < boardState.size && y >= 0 && y < boardState.size) {
        if (boardState.stones[x][y] === color) {
          const distance = Math.abs(dx) + Math.abs(dy);
          influence += (checkRadius - distance) * 0.2;
        }
      }
    }
  }
  
  return influence;
}

function evaluateGroupConnection(boardState: BoardState, move: Position, color: StoneColor): number {
  // Evaluate how well this move connects existing groups
  let connectionValue = 0;
  
  const adjacent = getAdjacentPositions(move, boardState.size);
  let friendlyAdjacent = 0;
  
  for (const adjPos of adjacent) {
    if (boardState.stones[adjPos.x][adjPos.y] === color) {
      friendlyAdjacent++;
    }
  }
  
  // Reward connecting to existing stones
  connectionValue = friendlyAdjacent * 0.5;
  
  return connectionValue;
}