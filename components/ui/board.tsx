'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StoneColor, Position, BoardState } from '@/lib/go/types';
import { cn } from '@/lib/utils';

interface GoBoardProps {
  size: number;
  boardState: BoardState;
  currentPlayer: StoneColor;
  onStonePlace?: (position: Position) => void;
  onCheckLegalMove?: (position: Position) => boolean;
  isGameActive?: boolean;
  showTerritory?: boolean;
  territoryOwners?: Map<string, StoneColor>;
  className?: string;
}

export function GoBoard({
  size,
  boardState,
  currentPlayer,
  onStonePlace,
  onCheckLegalMove,
  isGameActive = true,
  showTerritory = false,
  territoryOwners,
  className,
}: GoBoardProps) {
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const [isHoveredPositionLegal, setIsHoveredPositionLegal] = useState<boolean>(true);
  const boardRef = useRef<HTMLDivElement>(null);

  // Calculate board dimensions
  const cellSize = size === 19 ? 24 : 32; // Smaller cells for 19x19
  const boardSize = cellSize * (size - 1);
  const stoneSize = cellSize * 0.8;

  // Get star points based on board size
  const getStarPoints = useCallback((): Position[] => {
    if (size === 19) {
      return [
        { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
        { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
        { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
      ];
    } else if (size === 13) {
      return [
        { x: 3, y: 3 }, { x: 6, y: 6 }, { x: 9, y: 3 },
        { x: 3, y: 9 }, { x: 9, y: 9 },
      ];
    }
    return [];
  }, [size]);

  // Get Tengen (center point)
  const getTengen = useCallback((): Position => {
    const center = Math.floor(size / 2);
    return { x: center, y: center };
  }, [size]);

  // Handle mouse click on board
  const handleBoardClick = useCallback((event: React.MouseEvent) => {
    if (!isGameActive || !onStonePlace) return;

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Account for the padding offset
    const x = event.clientX - rect.left - cellSize / 2;
    const y = event.clientY - rect.top - cellSize / 2;

    // Convert pixel coordinates to board coordinates
    const boardX = Math.round(x / cellSize);
    const boardY = Math.round(y / cellSize);

    // Check if coordinates are within board bounds
    if (boardX >= 0 && boardX < size && boardY >= 0 && boardY < size) {
      onStonePlace({ x: boardX, y: boardY });
    }
  }, [cellSize, size, isGameActive, onStonePlace]);

  // Handle mouse move for hover effect
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isGameActive) return;

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Account for the padding offset
    const x = event.clientX - rect.left - cellSize / 2;
    const y = event.clientY - rect.top - cellSize / 2;

    const boardX = Math.round(x / cellSize);
    const boardY = Math.round(y / cellSize);

    if (boardX >= 0 && boardX < size && boardY >= 0 && boardY < size) {
      // Only show hover if position is empty
      if (boardState.stones[boardY][boardX] === StoneColor.EMPTY) {
        const position = { x: boardX, y: boardY };
        const isLegal = onCheckLegalMove ? onCheckLegalMove(position) : true;
        
        setHoveredPosition(position);
        setIsHoveredPositionLegal(isLegal);
      } else {
        setHoveredPosition(null);
        setIsHoveredPositionLegal(true);
      }
    } else {
      setHoveredPosition(null);
      setIsHoveredPositionLegal(true);
    }
  }, [cellSize, size, isGameActive, boardState.stones, onCheckLegalMove]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredPosition(null);
    setIsHoveredPositionLegal(true);
  }, []);

  // Generate grid lines
  const gridLines = [];
  
  // Horizontal lines
  for (let i = 0; i < size; i++) {
    gridLines.push(
      <line
        key={`h-${i}`}
        x1={0}
        y1={i * cellSize}
        x2={boardSize}
        y2={i * cellSize}
        stroke="#8B4513"
        strokeWidth={1}
      />
    );
  }
  
  // Vertical lines
  for (let i = 0; i < size; i++) {
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={i * cellSize}
        y1={0}
        x2={i * cellSize}
        y2={boardSize}
        stroke="#8B4513"
        strokeWidth={1}
      />
    );
  }

  const starPoints = getStarPoints();
  const tengen = getTengen();

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Board background */}
      <div
        ref={boardRef}
        className={cn(
          "relative bg-amber-100 border-4 border-amber-800",
          !isGameActive ? "cursor-default" :
          hoveredPosition && !isHoveredPositionLegal ? "cursor-not-allowed" :
          "cursor-crosshair"
        )}
        style={{
          width: boardSize + cellSize,
          height: boardSize + cellSize,
          padding: cellSize / 2,
        }}
        onClick={handleBoardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* SVG for grid lines and markers */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={boardSize + cellSize}
          height={boardSize + cellSize}
          style={{ top: 0, left: 0 }}
        >
          <g transform={`translate(${cellSize / 2}, ${cellSize / 2})`}>
            {gridLines}
            
            {/* Star points */}
            {starPoints.map((point, index) => (
              <circle
                key={`star-${index}`}
                cx={point.x * cellSize}
                cy={point.y * cellSize}
                r={3}
                fill="#654321"
              />
            ))}
          </g>
        </svg>

        {/* Territory overlay */}
        {showTerritory && territoryOwners && (
          <div className="absolute inset-0 pointer-events-none" style={{ padding: cellSize / 2 }}>
            {Array.from({ length: size }, (_, y) =>
              Array.from({ length: size }, (_, x) => {
                const key = `${x},${y}`;
                const owner = territoryOwners.get(key);
                if (!owner || owner === StoneColor.EMPTY || boardState.stones[y][x] !== StoneColor.EMPTY) {
                  return null;
                }

                return (
                  <div
                    key={key}
                    className={cn(
                      'absolute rounded-sm opacity-30',
                      owner === StoneColor.BLACK ? 'bg-gray-800' : 'bg-gray-200'
                    )}
                    style={{
                      left: x * cellSize - cellSize / 4,
                      top: y * cellSize - cellSize / 4,
                      width: cellSize / 2,
                      height: cellSize / 2,
                    }}
                  />
                );
              })
            )}
          </div>
        )}

        {/* Stones */}
        {boardState.stones.map((row, y) =>
          row.map((stone, x) => {
            if (stone === StoneColor.EMPTY) return null;

            const isBlack = stone === StoneColor.BLACK;
            
            return (
              <div
                key={`stone-${x}-${y}`}
                className={cn(
                  'absolute rounded-full border-2 shadow-lg pointer-events-none',
                  isBlack 
                    ? 'bg-gray-900 border-gray-700' 
                    : 'bg-white border-gray-300'
                )}
                style={{
                  left: x * cellSize - stoneSize / 2 + cellSize / 2,
                  top: y * cellSize - stoneSize / 2 + cellSize / 2,
                  width: stoneSize,
                  height: stoneSize,
                }}
              />
            );
          })
        )}

        {/* Hover stone preview */}
        {hoveredPosition && isGameActive && (
          <div
            className={cn(
              'absolute rounded-full border-2 pointer-events-none',
              isHoveredPositionLegal
                ? cn(
                    'opacity-50',
                    currentPlayer === StoneColor.BLACK
                      ? 'bg-gray-900 border-gray-700'
                      : 'bg-white border-gray-300'
                  )
                : 'opacity-30 bg-red-500 border-red-700'
            )}
            style={{
              left: hoveredPosition.x * cellSize - stoneSize / 2 + cellSize / 2,
              top: hoveredPosition.y * cellSize - stoneSize / 2 + cellSize / 2,
              width: stoneSize,
              height: stoneSize,
            }}
          />
        )}
        
        {/* Forbidden move indicator */}
        {hoveredPosition && isGameActive && !isHoveredPositionLegal && (
          <div
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              left: hoveredPosition.x * cellSize - stoneSize / 2 + cellSize / 2,
              top: hoveredPosition.y * cellSize - stoneSize / 2 + cellSize / 2,
              width: stoneSize,
              height: stoneSize,
            }}
          >
            <div className="text-white text-xs font-bold">✗</div>
          </div>
        )}
      </div>

      {/* Board coordinates (optional) */}
      <div className="absolute -left-8 top-0 h-full flex flex-col justify-around text-xs text-gray-600">
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="text-center">
            {size - i}
          </div>
        ))}
      </div>
      
      <div className="absolute -bottom-6 left-0 w-full flex justify-around text-xs text-gray-600">
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="text-center">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GoBoard;