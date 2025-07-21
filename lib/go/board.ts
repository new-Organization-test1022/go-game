import { StoneColor, Position, BoardState, Move } from './types';

export class GoBoard {
  private size: number;
  private stones: StoneColor[][];
  private capturedBlack: number = 0;
  private capturedWhite: number = 0;

  constructor(size: number = 19) {
    this.size = size;
    this.stones = this.initializeBoard();
  }

  private initializeBoard(): StoneColor[][] {
    return Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(StoneColor.EMPTY));
  }

  // Get current board state
  getBoardState(): BoardState {
    return {
      size: this.size,
      stones: this.stones.map(row => [...row]), // Deep copy
      capturedBlack: this.capturedBlack,
      capturedWhite: this.capturedWhite,
    };
  }

  // Set board state (for loading saved games)
  setBoardState(state: BoardState): void {
    this.size = state.size;
    this.stones = state.stones.map(row => [...row]);
    this.capturedBlack = state.capturedBlack;
    this.capturedWhite = state.capturedWhite;
  }

  // Check if position is within board bounds
  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.size && pos.y >= 0 && pos.y < this.size;
  }

  // Get stone color at position
  getStone(pos: Position): StoneColor {
    if (!this.isValidPosition(pos)) return StoneColor.EMPTY;
    return this.stones[pos.y][pos.x];
  }

  // Place a stone at position
  placeStone(pos: Position, color: StoneColor): void {
    if (this.isValidPosition(pos)) {
      this.stones[pos.y][pos.x] = color;
    }
  }

  // Remove stone at position
  removeStone(pos: Position): void {
    if (this.isValidPosition(pos)) {
      this.stones[pos.y][pos.x] = StoneColor.EMPTY;
    }
  }

  // Get adjacent positions (up, down, left, right)
  getAdjacentPositions(pos: Position): Position[] {
    const adjacent: Position[] = [];
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 },  // right
    ];

    for (const dir of directions) {
      const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
      if (this.isValidPosition(newPos)) {
        adjacent.push(newPos);
      }
    }

    return adjacent;
  }

  // Get all positions of a connected group
  getGroup(pos: Position): Position[] {
    const color = this.getStone(pos);
    if (color === StoneColor.EMPTY) return [];

    const group: Position[] = [];
    const visited = new Set<string>();
    const stack = [pos];

    while (stack.length > 0) {
      const current = stack.pop()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (this.getStone(current) === color) {
        group.push(current);
        
        // Add adjacent positions of same color to stack
        for (const adj of this.getAdjacentPositions(current)) {
          const adjKey = `${adj.x},${adj.y}`;
          if (!visited.has(adjKey) && this.getStone(adj) === color) {
            stack.push(adj);
          }
        }
      }
    }

    return group;
  }

  // Count liberties (empty adjacent positions) for a group
  countLiberties(group: Position[]): number {
    const liberties = new Set<string>();

    for (const pos of group) {
      for (const adj of this.getAdjacentPositions(pos)) {
        if (this.getStone(adj) === StoneColor.EMPTY) {
          liberties.add(`${adj.x},${adj.y}`);
        }
      }
    }

    return liberties.size;
  }

  // Find groups with no liberties (captured groups)
  findCapturedGroups(opponentColor: StoneColor): Position[][] {
    const capturedGroups: Position[][] = [];
    const visited = new Set<string>();

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const pos = { x, y };
        const key = `${x},${y}`;

        if (visited.has(key) || this.getStone(pos) !== opponentColor) {
          continue;
        }

        const group = this.getGroup(pos);
        const liberties = this.countLiberties(group);

        // Mark all positions in this group as visited
        for (const groupPos of group) {
          visited.add(`${groupPos.x},${groupPos.y}`);
        }

        // If group has no liberties, it's captured
        if (liberties === 0) {
          capturedGroups.push(group);
        }
      }
    }

    return capturedGroups;
  }

  // Remove captured stones and return their positions
  removeCapturedStones(capturedGroups: Position[][]): Position[] {
    const removedStones: Position[] = [];

    for (const group of capturedGroups) {
      for (const pos of group) {
        const color = this.getStone(pos);
        this.removeStone(pos);
        removedStones.push(pos);

        // Update capture count
        if (color === StoneColor.BLACK) {
          this.capturedBlack++;
        } else if (color === StoneColor.WHITE) {
          this.capturedWhite++;
        }
      }
    }

    return removedStones;
  }

  // Check if a move is legal
  isLegalMove(pos: Position, color: StoneColor, previousBoard?: BoardState): boolean {
    // Position must be empty
    if (this.getStone(pos) !== StoneColor.EMPTY) {
      return false;
    }

    // Create a temporary board to test the move
    const originalState = this.getBoardState();
    
    try {
      // Place the stone
      this.placeStone(pos, color);

      // Check for captures
      const opponentColor = color === StoneColor.BLACK ? StoneColor.WHITE : StoneColor.BLACK;
      const capturedGroups = this.findCapturedGroups(opponentColor);
      
      // Remove captured stones
      this.removeCapturedStones(capturedGroups);

      // Check if the played stone/group has liberties (suicide rule)
      const playedGroup = this.getGroup(pos);
      const playedLiberties = this.countLiberties(playedGroup);

      // Suicide is illegal unless it captures opponent stones
      if (playedLiberties === 0 && capturedGroups.length === 0) {
        return false;
      }

      // Check Ko rule (cannot return to previous board state)
      if (previousBoard) {
        const currentState = this.getBoardState();
        if (this.boardStatesEqual(currentState, previousBoard)) {
          return false;
        }
      }

      return true;
    } finally {
      // Restore original board state
      this.setBoardState(originalState);
    }
  }

  // Compare two board states for equality
  private boardStatesEqual(state1: BoardState, state2: BoardState): boolean {
    if (state1.size !== state2.size) return false;
    
    for (let y = 0; y < state1.size; y++) {
      for (let x = 0; x < state1.size; x++) {
        if (state1.stones[y][x] !== state2.stones[y][x]) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Execute a move and return captured stones
  makeMove(pos: Position, color: StoneColor): Position[] {
    if (!this.isLegalMove(pos, color)) {
      throw new Error('Illegal move');
    }

    // Place the stone
    this.placeStone(pos, color);

    // Find and remove captured opponent groups
    const opponentColor = color === StoneColor.BLACK ? StoneColor.WHITE : StoneColor.BLACK;
    const capturedGroups = this.findCapturedGroups(opponentColor);
    
    return this.removeCapturedStones(capturedGroups);
  }

  // Get star points for the board (handicap positions)
  getStarPoints(): Position[] {
    if (this.size === 19) {
      return [
        { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
        { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
        { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
      ];
    } else if (this.size === 13) {
      return [
        { x: 3, y: 3 }, { x: 6, y: 6 }, { x: 9, y: 3 },
        { x: 3, y: 9 }, { x: 9, y: 9 },
      ];
    }
    return [];
  }

  // Get center point (Tengen)
  getTengen(): Position {
    const center = Math.floor(this.size / 2);
    return { x: center, y: center };
  }

  // Clear the board
  clear(): void {
    this.stones = this.initializeBoard();
    this.capturedBlack = 0;
    this.capturedWhite = 0;
  }

  // Get board size
  getSize(): number {
    return this.size;
  }
}