import { GoBoard } from './board';
import { 
  StoneColor, 
  Position, 
  GameState, 
  GameStatus, 
  RuleType, 
  Move, 
  BoardState 
} from './types';

export class GoGame {
  private board: GoBoard;
  private gameState: GameState;
  private moveHistory: Move[] = [];

  constructor(
    size: number = 19, 
    ruleType: RuleType = RuleType.STANDARD,
    player1Id?: number,
    player2Id?: number
  ) {
    this.board = new GoBoard(size);
    this.gameState = {
      boardState: this.board.getBoardState(),
      currentPlayer: StoneColor.BLACK, // Black always goes first
      status: GameStatus.SETUP,
      ruleType,
      moves: [],
      player1Id,
      player2Id,
      startTime: Date.now(),
      blackScore: 0,
      whiteScore: 0,
    };
  }

  // Start the game
  startGame(): void {
    this.gameState.status = GameStatus.PLAYING;
    this.gameState.startTime = Date.now();
  }

  // Get current game state
  getGameState(): GameState {
    return {
      ...this.gameState,
      boardState: this.board.getBoardState(),
    };
  }

  // Load game state (for resuming saved games)
  loadGameState(state: GameState): void {
    this.gameState = { ...state };
    this.board.setBoardState(state.boardState);
    this.moveHistory = [...state.moves];
  }

  // Get current player
  getCurrentPlayer(): StoneColor {
    return this.gameState.currentPlayer;
  }

  // Switch to next player
  private switchPlayer(): void {
    this.gameState.currentPlayer = 
      this.gameState.currentPlayer === StoneColor.BLACK 
        ? StoneColor.WHITE 
        : StoneColor.BLACK;
  }

  // Check if a move is legal
  isLegalMove(pos: Position): boolean {
    if (this.gameState.status !== GameStatus.PLAYING) {
      return false;
    }

    // Get previous board state for Ko rule checking
    const previousBoard = this.moveHistory.length >= 2 
      ? (this.moveHistory[this.moveHistory.length - 2] as any).boardState
      : undefined;

    return this.board.isLegalMove(pos, this.gameState.currentPlayer, previousBoard);
  }

  // Make a move
  makeMove(pos: Position): boolean {
    if (!this.isLegalMove(pos)) {
      return false;
    }

    // Store board state before move (for Ko rule and undo)
    const boardStateBefore = this.board.getBoardState();

    try {
      // Execute the move
      const capturedStones = this.board.makeMove(pos, this.gameState.currentPlayer);

      // Create move record
      const move: Move & { boardState?: BoardState } = {
        position: pos,
        color: this.gameState.currentPlayer,
        capturedStones,
        timestamp: Date.now(),
        boardState: this.board.getBoardState(),
      };

      // Add to move history
      this.moveHistory.push(move);
      this.gameState.moves = [...this.moveHistory];

      // Update game state
      this.gameState.boardState = this.board.getBoardState();

      // Switch to next player
      this.switchPlayer();

      return true;
    } catch (error) {
      // Restore board state if move failed
      this.board.setBoardState(boardStateBefore);
      return false;
    }
  }

  // Undo last move
  undoLastMove(): boolean {
    if (this.moveHistory.length === 0) {
      return false;
    }

    // Remove last move
    this.moveHistory.pop();
    this.gameState.moves = [...this.moveHistory];

    // Restore board state
    if (this.moveHistory.length > 0) {
      const previousMove = this.moveHistory[this.moveHistory.length - 1] as any;
      this.board.setBoardState(previousMove.boardState!);
    } else {
      // If no moves left, clear the board
      this.board.clear();
    }

    // Update current player (switch back)
    this.switchPlayer();

    // Update game state
    this.gameState.boardState = this.board.getBoardState();

    return true;
  }

  // Pass turn (player chooses not to move)
  pass(): void {
    if (this.gameState.status !== GameStatus.PLAYING) {
      return;
    }

    // Create pass move record
    const move: Move & { boardState?: BoardState } = {
      position: { x: -1, y: -1 }, // Special position for pass
      color: this.gameState.currentPlayer,
      capturedStones: [],
      timestamp: Date.now(),
      boardState: this.board.getBoardState(),
    };

    this.moveHistory.push(move);
    this.gameState.moves = [...this.moveHistory];

    // Check if game should end (two consecutive passes)
    if (this.moveHistory.length >= 2) {
      const lastTwo = this.moveHistory.slice(-2);
      if (lastTwo.every(move => move.position.x === -1 && move.position.y === -1)) {
        this.endGame();
        return;
      }
    }

    this.switchPlayer();
  }

  // End the game
  endGame(): void {
    this.gameState.status = GameStatus.FINISHED;
    this.gameState.endTime = Date.now();
    
    // Calculate final scores
    const scores = this.calculateScore();
    this.gameState.blackScore = scores.blackTotal;
    this.gameState.whiteScore = scores.whiteTotal;
  }

  // Basic territory counting (simplified version)
  calculateScore(): { blackTotal: number; whiteTotal: number; blackTerritory: number; whiteTerritory: number } {
    const boardState = this.board.getBoardState();
    let blackTerritory = 0;
    let whiteTerritory = 0;

    // This is a simplified scoring algorithm
    // In a real implementation, you'd want more sophisticated territory detection
    const visited = new Set<string>();

    for (let y = 0; y < boardState.size; y++) {
      for (let x = 0; x < boardState.size; x++) {
        const pos = { x, y };
        const key = `${x},${y}`;

        if (visited.has(key) || this.board.getStone(pos) !== StoneColor.EMPTY) {
          continue;
        }

        // Find connected empty area
        const emptyGroup = this.findEmptyArea(pos, visited);
        const surroundingColors = this.getAreaSurrounding(emptyGroup);

        // Determine territory owner
        if (surroundingColors.has(StoneColor.BLACK) && !surroundingColors.has(StoneColor.WHITE)) {
          blackTerritory += emptyGroup.length;
        } else if (surroundingColors.has(StoneColor.WHITE) && !surroundingColors.has(StoneColor.BLACK)) {
          whiteTerritory += emptyGroup.length;
        }
        // If surrounded by both colors or neither, it's neutral territory
      }
    }

    // Calculate total scores
    const blackTotal = blackTerritory + boardState.capturedWhite;
    const whiteTotal = whiteTerritory + boardState.capturedBlack;

    return {
      blackTotal,
      whiteTotal,
      blackTerritory,
      whiteTerritory,
    };
  }

  // Find connected empty area starting from a position
  private findEmptyArea(startPos: Position, visited: Set<string>): Position[] {
    const area: Position[] = [];
    const stack = [startPos];

    while (stack.length > 0) {
      const pos = stack.pop()!;
      const key = `${pos.x},${pos.y}`;

      if (visited.has(key) || this.board.getStone(pos) !== StoneColor.EMPTY) {
        continue;
      }

      visited.add(key);
      area.push(pos);

      // Add adjacent empty positions
      for (const adj of this.board.getAdjacentPositions(pos)) {
        const adjKey = `${adj.x},${adj.y}`;
        if (!visited.has(adjKey) && this.board.getStone(adj) === StoneColor.EMPTY) {
          stack.push(adj);
        }
      }
    }

    return area;
  }

  // Get colors surrounding an empty area
  private getAreaSurrounding(area: Position[]): Set<StoneColor> {
    const surrounding = new Set<StoneColor>();

    for (const pos of area) {
      for (const adj of this.board.getAdjacentPositions(pos)) {
        const color = this.board.getStone(adj);
        if (color !== StoneColor.EMPTY) {
          surrounding.add(color);
        }
      }
    }

    return surrounding;
  }

  // Get move history
  getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  // Get game duration in seconds
  getGameDuration(): number {
    const endTime = this.gameState.endTime || Date.now();
    return Math.floor((endTime - this.gameState.startTime) / 1000);
  }

  // Export game record as SGF-like string
  exportGameRecord(): string {
    const moves = this.moveHistory
      .filter(move => move.position.x !== -1) // Exclude passes for now
      .map(move => {
        const color = move.color === StoneColor.BLACK ? 'B' : 'W';
        const pos = `${String.fromCharCode(97 + move.position.x)}${String.fromCharCode(97 + move.position.y)}`;
        return `${color}[${pos}]`;
      });

    return moves.join(';');
  }

  // Reset game
  reset(): void {
    this.board.clear();
    this.moveHistory = [];
    this.gameState = {
      ...this.gameState,
      boardState: this.board.getBoardState(),
      currentPlayer: StoneColor.BLACK,
      status: GameStatus.SETUP,
      moves: [],
      startTime: Date.now(),
      endTime: undefined,
      blackScore: 0,
      whiteScore: 0,
    };
  }
}