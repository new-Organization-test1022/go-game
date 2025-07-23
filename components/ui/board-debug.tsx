// 调试用的棋盘组件，用于测试坐标计算
'use client';

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { StoneColor, Position, BoardState } from '@/lib/go/types';
import { cn } from '@/lib/utils';
import { deepEqual } from '@/lib/utils/performance';

interface GoBoardDebugProps {
  size: number;
  boardState: BoardState;
  currentPlayer: StoneColor;
  onStonePlace?: (position: Position) => void;
  onCheckLegalMove?: (position: Position) => boolean;
  isGameActive?: boolean;
  showTerritory?: boolean;
  territoryOwners?: Map<string, StoneColor>;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const GoBoardDebugComponent = function GoBoardDebug({
  size,
  boardState,
  currentPlayer,
  onStonePlace,
  onCheckLegalMove,
  isGameActive = true,
  showTerritory = false,
  territoryOwners,
  className,
  isFullscreen = false,
  onToggleFullscreen,
}: GoBoardDebugProps) {
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const [isHoveredPositionLegal, setIsHoveredPositionLegal] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const boardRef = useRef<HTMLDivElement>(null);

  // Calculate board dimensions - adjust for fullscreen
  const cellSize = isFullscreen 
    ? (size === 19 ? 32 : 42) 
    : (size === 19 ? 28 : 36);
  const boardSize = cellSize * (size - 1);
  const stoneSize = cellSize * 0.85;
  const boardPadding = cellSize;

  // Handle mouse move for hover effect with debug info
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isGameActive) return;

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate coordinates step by step
    const clientX = event.clientX;
    const clientY = event.clientY;
    const rectLeft = rect.left;
    const rectTop = rect.top;
    
    const x = clientX - rectLeft - boardPadding;
    const y = clientY - rectTop - boardPadding;
    
    const boardX = Math.round(x / cellSize);
    const boardY = Math.round(y / cellSize);
    
    // Update debug info
    setDebugInfo(`
      Mouse: (${clientX}, ${clientY})
      Rect: (${rectLeft}, ${rectTop})
      Adjusted: (${x.toFixed(1)}, ${y.toFixed(1)})
      Board: (${boardX}, ${boardY})
      CellSize: ${cellSize}
      StoneSize: ${stoneSize}
      Expected Stone Position: (${boardX * cellSize - stoneSize / 2}, ${boardY * cellSize - stoneSize / 2})
    `);

    if (boardX >= 0 && boardX < size && boardY >= 0 && boardY < size) {
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
  }, [cellSize, size, isGameActive, boardState.stones, onCheckLegalMove, boardPadding, stoneSize]);

  // Handle mouse click on board
  const handleBoardClick = useCallback((event: React.MouseEvent) => {
    if (!isGameActive || !onStonePlace) return;

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left - boardPadding;
    const y = event.clientY - rect.top - boardPadding;

    const boardX = Math.round(x / cellSize);
    const boardY = Math.round(y / cellSize);

    if (boardX >= 0 && boardX < size && boardY >= 0 && boardY < size) {
      onStonePlace({ x: boardX, y: boardY });
    }
  }, [cellSize, size, isGameActive, onStonePlace, boardPadding]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredPosition(null);
    setIsHoveredPositionLegal(true);
    setDebugInfo('');
  }, []);

  // Generate grid lines
  const gridLines = [];
  
  for (let i = 0; i < size; i++) {
    gridLines.push(
      <line
        key={`h-${i}`}
        x1={0}
        y1={i * cellSize}
        x2={boardSize}
        y2={i * cellSize}
        stroke="#2D1810"
        strokeWidth={1.5}
      />
    );
  }
  
  for (let i = 0; i < size; i++) {
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={i * cellSize}
        y1={0}
        x2={i * cellSize}
        y2={boardSize}
        stroke="#2D1810"
        strokeWidth={1.5}
      />
    );
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Debug info */}
      <div className="absolute -top-32 left-0 bg-black text-white p-2 text-xs whitespace-pre-line z-50">
        {debugInfo}
      </div>
      
      {/* Board background */}
      <div
        ref={boardRef}
        className={cn(
          "relative border-4 border-amber-800 shadow-lg",
          "bg-amber-100",
          !isGameActive ? "cursor-default" :
          hoveredPosition && !isHoveredPositionLegal ? "cursor-not-allowed" :
          "cursor-crosshair"
        )}
        style={{
          width: boardSize + 2 * boardPadding,
          height: boardSize + 2 * boardPadding,
          backgroundColor: '#F3E5AB',
        }}
        onClick={handleBoardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* SVG for grid lines */}
        <svg
          className="absolute pointer-events-none z-10"
          width={boardSize + 2 * boardPadding}
          height={boardSize + 2 * boardPadding}
          style={{ top: 0, left: 0 }}
        >
          <g transform={`translate(${boardPadding}, ${boardPadding})`}>
            {gridLines}
          </g>
        </svg>

        {/* Stones */}
        <div className="absolute z-30" style={{ padding: boardPadding }}>
          {boardState.stones.map((row, y) =>
            row.map((stone, x) => {
              if (stone === StoneColor.EMPTY) return null;

              const isBlack = stone === StoneColor.BLACK;
              
              return (
                <div
                  key={`stone-${x}-${y}`}
                  className={cn(
                    'absolute rounded-full shadow-xl pointer-events-none',
                    'border-2 transition-all duration-200',
                    isBlack 
                      ? 'bg-gradient-to-br from-gray-800 to-black border-gray-900 shadow-black/50' 
                      : 'bg-gradient-to-br from-white to-gray-100 border-gray-400 shadow-gray-500/50'
                  )}
                  style={{
                    left: x * cellSize - stoneSize / 2,
                    top: y * cellSize - stoneSize / 2,
                    width: stoneSize,
                    height: stoneSize,
                  }}
                />
              );
            })
          )}
        </div>

        {/* Hover stone preview */}
        {hoveredPosition && isGameActive && (
          <div className="absolute z-40" style={{ padding: boardPadding }}>
            <div
              className={cn(
                'absolute rounded-full border-2 pointer-events-none transition-all duration-150',
                isHoveredPositionLegal
                  ? cn(
                      'opacity-60',
                      currentPlayer === StoneColor.BLACK
                        ? 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-800'
                        : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
                    )
                  : 'opacity-40 bg-gradient-to-br from-red-400 to-red-600 border-red-700'
              )}
              style={{
                left: hoveredPosition.x * cellSize - stoneSize / 2,
                top: hoveredPosition.y * cellSize - stoneSize / 2,
                width: stoneSize,
                height: stoneSize,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const GoBoardDebug = memo(GoBoardDebugComponent);
export default GoBoardDebug;