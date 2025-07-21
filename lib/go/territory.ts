import { GoBoard } from './board';
import { StoneColor, Position, Territory, ScoreInfo } from './types';

export class TerritoryCounter {
  private board: GoBoard;

  constructor(board: GoBoard) {
    this.board = board;
  }

  // Calculate comprehensive score information
  calculateScore(): ScoreInfo {
    const territories = this.findAllTerritories();
    const boardState = this.board.getBoardState();

    let blackTerritory = 0;
    let whiteTerritory = 0;

    for (const territory of territories) {
      if (territory.owner === StoneColor.BLACK) {
        blackTerritory += territory.positions.length;
      } else if (territory.owner === StoneColor.WHITE) {
        whiteTerritory += territory.positions.length;
      }
    }

    return {
      blackTerritory,
      whiteTerritory,
      blackCaptured: boardState.capturedWhite,
      whiteCaptured: boardState.capturedBlack,
      blackTotal: blackTerritory + boardState.capturedWhite,
      whiteTotal: whiteTerritory + boardState.capturedBlack,
      territories,
    };
  }

  // Find all territories on the board
  private findAllTerritories(): Territory[] {
    const territories: Territory[] = [];
    const visited = new Set<string>();

    for (let y = 0; y < this.board.getSize(); y++) {
      for (let x = 0; x < this.board.getSize(); x++) {
        const pos = { x, y };
        const key = `${x},${y}`;

        if (visited.has(key) || this.board.getStone(pos) !== StoneColor.EMPTY) {
          continue;
        }

        const territory = this.analyzeTerritory(pos, visited);
        if (territory) {
          territories.push(territory);
        }
      }
    }

    return territories;
  }

  // Analyze a territory starting from an empty position
  private analyzeTerritory(startPos: Position, globalVisited: Set<string>): Territory | null {
    const emptyPositions: Position[] = [];
    const visited = new Set<string>();
    const stack = [startPos];
    const borderingColors = new Set<StoneColor>();

    // Find all connected empty positions
    while (stack.length > 0) {
      const pos = stack.pop()!;
      const key = `${pos.x},${pos.y}`;

      if (visited.has(key)) continue;

      if (this.board.getStone(pos) === StoneColor.EMPTY) {
        visited.add(key);
        globalVisited.add(key);
        emptyPositions.push(pos);

        // Check adjacent positions
        for (const adj of this.board.getAdjacentPositions(pos)) {
          const adjKey = `${adj.x},${adj.y}`;
          const adjColor = this.board.getStone(adj);

          if (adjColor === StoneColor.EMPTY && !visited.has(adjKey)) {
            stack.push(adj);
          } else if (adjColor !== StoneColor.EMPTY) {
            borderingColors.add(adjColor);
          }
        }
      }
    }

    // Determine territory owner
    let owner = StoneColor.EMPTY;
    let isSecure = false;

    if (borderingColors.size === 1) {
      // Territory is surrounded by only one color
      owner = borderingColors.values().next().value;
      isSecure = this.isTerritorySecure(emptyPositions, owner);
    } else if (borderingColors.size === 0) {
      // No bordering stones (shouldn't happen in normal games)
      owner = StoneColor.EMPTY;
      isSecure = false;
    } else {
      // Territory is contested (borders both colors)
      owner = StoneColor.EMPTY;
      isSecure = false;
    }

    return {
      positions: emptyPositions,
      owner,
      isSecure,
    };
  }

  // Check if a territory is truly secure (simplified heuristic)
  private isTerritorySecure(territoryPositions: Position[], owner: StoneColor): boolean {
    // This is a simplified check - in a real implementation you'd want
    // more sophisticated life/death analysis
    
    // For now, we consider small territories (< 3 points) potentially insecure
    // and larger territories as more likely to be secure
    if (territoryPositions.length < 3) {
      return false;
    }

    // Check if the territory has at least 2 separate boundary groups
    // (this is a very basic heuristic)
    const boundaryGroups = this.findBoundaryGroups(territoryPositions, owner);
    
    // If territory is surrounded by multiple groups of the same color,
    // it's more likely to be secure
    return boundaryGroups.length >= 2 || territoryPositions.length >= 5;
  }

  // Find groups of stones bordering a territory
  private findBoundaryGroups(territoryPositions: Position[], color: StoneColor): Position[][] {
    const boundaryStones = new Set<string>();
    const visited = new Set<string>();
    const groups: Position[][] = [];

    // Find all boundary stones of the specified color
    for (const pos of territoryPositions) {
      for (const adj of this.board.getAdjacentPositions(pos)) {
        if (this.board.getStone(adj) === color) {
          boundaryStones.add(`${adj.x},${adj.y}`);
        }
      }
    }

    // Group connected boundary stones
    for (const stoneKey of boundaryStones) {
      if (visited.has(stoneKey)) continue;

      const [x, y] = stoneKey.split(',').map(Number);
      const pos = { x, y };
      const group = this.board.getGroup(pos);
      
      // Mark all stones in this group as visited
      for (const groupPos of group) {
        visited.add(`${groupPos.x},${groupPos.y}`);
      }

      groups.push(group);
    }

    return groups;
  }

  // Get detailed territory information for UI display
  getTerritoryInfo(): {
    blackTerritories: Territory[];
    whiteTerritories: Territory[];
    neutralTerritories: Territory[];
    totalBlackPoints: number;
    totalWhitePoints: number;
  } {
    const territories = this.findAllTerritories();
    
    const blackTerritories = territories.filter(t => t.owner === StoneColor.BLACK);
    const whiteTerritories = territories.filter(t => t.owner === StoneColor.WHITE);
    const neutralTerritories = territories.filter(t => t.owner === StoneColor.EMPTY);

    const totalBlackPoints = blackTerritories.reduce((sum, t) => sum + t.positions.length, 0);
    const totalWhitePoints = whiteTerritories.reduce((sum, t) => sum + t.positions.length, 0);

    return {
      blackTerritories,
      whiteTerritories,
      neutralTerritories,
      totalBlackPoints,
      totalWhitePoints,
    };
  }

  // Check if a position is part of secure territory
  isSecureTerritory(pos: Position): boolean {
    if (this.board.getStone(pos) !== StoneColor.EMPTY) {
      return false;
    }

    const visited = new Set<string>();
    const territory = this.analyzeTerritory(pos, visited);
    
    return territory ? territory.isSecure : false;
  }

  // Get territory owner at position (for UI highlighting)
  getTerritoryOwner(pos: Position): StoneColor {
    if (this.board.getStone(pos) !== StoneColor.EMPTY) {
      return StoneColor.EMPTY;
    }

    const visited = new Set<string>();
    const territory = this.analyzeTerritory(pos, visited);
    
    return territory ? territory.owner : StoneColor.EMPTY;
  }
}