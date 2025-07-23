'use client';

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { StoneColor, Position, BoardState } from '@/lib/go/types';
import { cn } from '@/lib/utils';
import { deepEqual } from '@/lib/utils/performance';

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
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const GoBoardComponent = function GoBoard({
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
}: GoBoardProps) {
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const [isHoveredPositionLegal, setIsHoveredPositionLegal] = useState<boolean>(true);
  const boardRef = useRef<HTMLDivElement>(null);

  // Calculate board dimensions - adjust for fullscreen
  const cellSize = isFullscreen 
    ? (size === 19 ? 35 : size === 13 ? 42 : 50) 
    : (size === 19 ? 28 : size === 13 ? 32 : 40); // Cell size for grid spacing
  const boardSize = cellSize * (size - 1); // Board spans from first to last line
  const stoneSize = cellSize * 0.85; // Stone size relative to cell
  const boardPadding = cellSize; // Padding around the board

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
    } else if (size === 9) {
      return [
        { x: 2, y: 2 }, { x: 4, y: 4 }, { x: 6, y: 2 },
        { x: 2, y: 6 }, { x: 6, y: 6 },
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
    const x = event.clientX - rect.left - boardPadding;
    const y = event.clientY - rect.top - boardPadding;

    // Convert pixel coordinates to board coordinates
    const boardX = Math.round(x / cellSize);
    const boardY = Math.round(y / cellSize);

    // Check if coordinates are within board bounds
    if (boardX >= 0 && boardX < size && boardY >= 0 && boardY < size) {
      onStonePlace({ x: boardX, y: boardY });
    }
  }, [cellSize, size, isGameActive, onStonePlace, boardPadding]);

  // Handle mouse move for hover effect
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isGameActive) return;

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Account for the padding offset
    const x = event.clientX - rect.left - boardPadding;
    const y = event.clientY - rect.top - boardPadding;

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
  }, [cellSize, size, isGameActive, boardState.stones, onCheckLegalMove, boardPadding]);

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
        stroke="#2D1810"
        strokeWidth={1.5}
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
        stroke="#2D1810"
        strokeWidth={1.5}
      />
    );
  }

  const starPoints = getStarPoints();
  const tengen = getTengen();

  const boardElement = (
    <div className={cn('relative inline-block', className)}>
      {/* 全屏切换按钮 - 调整位置避免遮挡棋盘 */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className={cn(
            "absolute z-50 bg-amber-800 text-white p-2 rounded-md shadow-lg hover:bg-amber-700 transition-colors",
            isFullscreen 
              ? "top-4 right-4" // 全屏模式下放在右上角
              : "-top-12 -right-12" // 非全屏模式下放在棋盘外部，不遮挡棋盘
          )}
          title={isFullscreen ? '退出全屏' : '全屏显示'}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      )}
      
      {/* Board background */}
      <div
        ref={boardRef}
        className={cn(
          "relative border-4 border-amber-800 shadow-lg",
          "bg-amber-100", // 纯木头色
          !isGameActive ? "cursor-default" :
          hoveredPosition && !isHoveredPositionLegal ? "cursor-not-allowed" :
          "cursor-crosshair"
        )}
        style={{
          width: boardSize + 2 * boardPadding,
          height: boardSize + 2 * boardPadding,
          backgroundColor: '#F3E5AB', // 纯木头色
        }}
        onClick={handleBoardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* SVG for grid lines and markers */}
        <svg
          className="absolute pointer-events-none z-10"
          width={boardSize + 2 * boardPadding}
          height={boardSize + 2 * boardPadding}
          style={{ top: 0, left: 0 }}
        >
          <g transform={`translate(${boardPadding}, ${boardPadding})`}>
            {gridLines}
            
            {/* Star points */}
            {starPoints.map((point, index) => (
              <circle
                key={`star-${index}`}
                cx={point.x * cellSize}
                cy={point.y * cellSize}
                r={3}
                fill="#1A0E0A"
              />
            ))}
          </g>
        </svg>

        {/* Territory overlay */}
        {showTerritory && territoryOwners && (
          <div className="absolute inset-0 pointer-events-none z-20" style={{ padding: boardPadding }}>
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
                      'absolute rounded-full opacity-40',
                      owner === StoneColor.BLACK ? 'bg-gray-800' : 'bg-gray-200'
                    )}
                    style={{
                      left: x * cellSize - cellSize / 3,
                      top: y * cellSize - cellSize / 3,
                      width: cellSize * 2 / 3,
                      height: cellSize * 2 / 3,
                    }}
                  />
                );
              })
            )}
          </div>
        )}

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
        
        {/* Forbidden move indicator */}
        {hoveredPosition && isGameActive && !isHoveredPositionLegal && (
          <div className="absolute z-50" style={{ padding: boardPadding }}>
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                left: hoveredPosition.x * cellSize - stoneSize / 2,
                top: hoveredPosition.y * cellSize - stoneSize / 2,
                width: stoneSize,
                height: stoneSize,
              }}
            >
              <div className="text-white text-sm font-bold drop-shadow-lg">✗</div>
            </div>
          </div>
        )}
      </div>

      {/* Board coordinates (optional) */}
      <div 
        className="absolute -left-10 flex flex-col justify-between text-xs text-amber-800 font-semibold"
        style={{
          top: boardPadding,
          height: boardSize,
        }}
      >
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="text-center leading-none">
            {size - i}
          </div>
        ))}
      </div>
      
      <div 
        className="absolute -bottom-8 flex justify-between text-xs text-amber-800 font-semibold"
        style={{
          left: boardPadding,
          width: boardSize,
        }}
      >
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="text-center leading-none">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
    </div>
  );

  // Return board wrapped in fullscreen container if needed
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        {boardElement}
      </div>
    );
  }

  return boardElement;
};

// 使用React.memo优化重新渲染
export const GoBoard = memo(GoBoardComponent, (prevProps, nextProps) => {
  // 自定义比较函数，只有关键属性变化时才重新渲染
  return (
    prevProps.size === nextProps.size &&
    prevProps.currentPlayer === nextProps.currentPlayer &&
    prevProps.isGameActive === nextProps.isGameActive &&
    prevProps.showTerritory === nextProps.showTerritory &&
    prevProps.isFullscreen === nextProps.isFullscreen &&
    deepEqual(prevProps.boardState, nextProps.boardState) &&
    deepEqual(prevProps.territoryOwners, nextProps.territoryOwners)
  );
});

export default GoBoard;