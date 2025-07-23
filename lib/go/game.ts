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
    player2Id?: number,
    captureLimit?: number,
    moveLimit?: number
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
      captureLimit,
      moveLimit,
      consecutivePasses: 0,
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

  // Set game ID for database operations
  setGameId(id: number): void {
    this.gameState.id = id;
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
      
      // Reset consecutive passes since a move was made
      this.gameState.consecutivePasses = 0;

      // Check for game end conditions after the move
      this.checkGameEndConditions();

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
    
    // Increment consecutive passes
    this.gameState.consecutivePasses = (this.gameState.consecutivePasses || 0) + 1;

    // Check if game should end (two consecutive passes for standard rules)
    if (this.gameState.ruleType === RuleType.STANDARD && this.gameState.consecutivePasses >= 2) {
      this.endGame(undefined, 'consecutive_passes');
      return;
    }

    this.switchPlayer();
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
  
  // Get the winner of the game
  getWinner(): StoneColor | undefined {
    if (this.gameState.status !== GameStatus.FINISHED) {
      return undefined;
    }
    
    if (this.gameState.blackScore > this.gameState.whiteScore) {
      return StoneColor.BLACK;
    } else if (this.gameState.whiteScore > this.gameState.blackScore) {
      return StoneColor.WHITE;
    }
    
    return undefined; // Tie
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

  // Check game end conditions (capture limit, move limit, etc.)
  private checkGameEndConditions(): void {
    if (this.gameState.status !== GameStatus.PLAYING) {
      return;
    }

    const boardState = this.board.getBoardState();
    
    // For capture rule games
    if (this.gameState.ruleType === RuleType.CAPTURE) {
      // Check capture limit
      if (this.gameState.captureLimit) {
        if (boardState.capturedBlack >= this.gameState.captureLimit) {
          this.endGame(StoneColor.WHITE, 'capture_limit');
          return;
        }
        if (boardState.capturedWhite >= this.gameState.captureLimit) {
          this.endGame(StoneColor.BLACK, 'capture_limit');
          return;
        }
      }
      
      // Check move limit
      if (this.gameState.moveLimit && this.moveHistory.length >= this.gameState.moveLimit) {
        // Winner is determined by who captured more stones
        const blackCaptured = boardState.capturedWhite;
        const whiteCaptured = boardState.capturedBlack;
        
        if (blackCaptured > whiteCaptured) {
          this.endGame(StoneColor.BLACK, 'move_limit');
        } else if (whiteCaptured > blackCaptured) {
          this.endGame(StoneColor.WHITE, 'move_limit');
        } else {
          // Tie - could be handled differently
          this.endGame(undefined, 'move_limit_tie');
        }
        return;
      }
    }
    
    // For standard rule games - no automatic end conditions during play
    // The game ends when both players pass consecutively (handled in pass() method)
  }

  // End the game with specified winner and reason
  private endGame(winner?: StoneColor, reason?: string): void {
    this.gameState.status = GameStatus.FINISHED;
    this.gameState.endTime = Date.now();
    this.gameState.endReason = reason;
    
    // Update scores based on rule type
    if (this.gameState.ruleType === RuleType.CAPTURE) {
      const boardState = this.board.getBoardState();
      this.gameState.blackScore = boardState.capturedWhite; // Black's score = white stones captured
      this.gameState.whiteScore = boardState.capturedBlack; // White's score = black stones captured
    } else {
      // For standard rules, calculate territory
      const scoreInfo = this.calculateScore();
      this.gameState.blackScore = scoreInfo.blackTotal;
      this.gameState.whiteScore = scoreInfo.whiteTotal;
      
      // Determine winner if not explicitly provided
      if (winner === undefined && reason === 'consecutive_passes') {
        if (scoreInfo.blackTotal > scoreInfo.whiteTotal) {
          winner = StoneColor.BLACK;
        } else if (scoreInfo.whiteTotal > scoreInfo.blackTotal) {
          winner = StoneColor.WHITE;
        }
        // If tied, winner remains undefined
      }
    }
    
    // Set winner in game state (this might need to be stored somewhere accessible)
    // For now, the winner can be determined from the scores
    
    // Save game record and statistics if game has an ID
    if (this.gameState.id) {
      this.saveGameRecord().catch(console.error);
    }
  }

  // Save complete game record including moves and statistics
  private async saveGameRecord(): Promise<void> {
    if (!this.gameState.id) return;

    try {
      const gameData = {
        id: this.gameState.id,
        status: 'finished',
        duration: this.getGameDuration(),
        blackScore: this.gameState.blackScore,
        whiteScore: this.gameState.whiteScore,
        totalMoves: this.moveHistory.length,
        blackCapturedStones: this.board.getBoardState().capturedWhite,
        whiteCapturedStones: this.board.getBoardState().capturedBlack,
        endReason: this.gameState.endReason,
        record: JSON.stringify(this.moveHistory),
        winnerId: this.getWinnerPlayerId(),
        updatedAt: Date.now(),
      };

      // Update game record
      const response = await fetch(`/api/games/${this.gameState.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error('Failed to save game record');
      }

      // Save detailed move records
      await this.saveDetailedMoves();
      
      // Update player statistics
      if (this.gameState.player1Id) {
        await this.updatePlayerStats(this.gameState.player1Id);
      }
      if (this.gameState.player2Id) {
        await this.updatePlayerStats(this.gameState.player2Id);
      }
    } catch (error) {
      console.error('Failed to save game record:', error);
    }
  }

  // Save detailed move records for replay
  private async saveDetailedMoves(): Promise<void> {
    if (!this.gameState.id) return;

    try {
      for (let i = 0; i < this.moveHistory.length; i++) {
        const move = this.moveHistory[i];
        const moveData = {
          gameId: this.gameState.id,
          moveNumber: i + 1,
          playerId: move.color === StoneColor.BLACK ? this.gameState.player1Id : this.gameState.player2Id,
          stoneColor: move.color === StoneColor.BLACK ? 'black' : 'white',
          positionX: move.position.x,
          positionY: move.position.y,
          capturedStones: JSON.stringify(move.capturedStones),
          timeUsed: 0, // Would need to track individual move times
          boardStateAfter: JSON.stringify((move as any).boardState),
          timestamp: move.timestamp,
        };

        await fetch('/api/moves', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(moveData),
        });
      }
    } catch (error) {
      console.error('Failed to save move records:', error);
    }
  }

  // Get winner player ID
  private getWinnerPlayerId(): number | null {
    const winner = this.getWinner();
    if (!winner) return null;
    
    return winner === StoneColor.BLACK ? this.gameState.player1Id || null : this.gameState.player2Id || null;
  }

  // Update player statistics
  private async updatePlayerStats(playerId: number): Promise<void> {
    try {
      await fetch(`/api/stats/${playerId}/update`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to update player stats:', error);
    }
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