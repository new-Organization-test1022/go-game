'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoBoard } from '@/components/ui/board';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Square,
  FastForward,
  Rewind,
  Clock,
  User,
  Trophy
} from 'lucide-react';
import { StoneColor, Position, Move, BoardState } from '@/lib/go/types';
import { GameMove, Game, Player } from '@/lib/db/schema';

interface GameReplayProps {
  gameId: number;
  game: Game;
  player1?: Player;
  player2?: Player;
  moves: GameMove[];
  onClose?: () => void;
}

export function GameReplay({ 
  gameId, 
  game, 
  player1, 
  player2, 
  moves, 
  onClose 
}: GameReplayProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 1x, 2x, 4x speed
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [boardState, setBoardState] = useState<BoardState>({
    size: game.boardSize,
    stones: Array(game.boardSize).fill(null).map(() => Array(game.boardSize).fill(StoneColor.EMPTY)),
    capturedBlack: 0,
    capturedWhite: 0,
  });

  // Initialize board state
  useEffect(() => {
    resetBoard();
  }, [game.boardSize]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || currentMoveIndex >= moves.length) {
      setIsPlaying(false);
      return;
    }

    const timeout = setTimeout(() => {
      goToNextMove();
    }, 1000 / playSpeed);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentMoveIndex, playSpeed, moves.length]);

  const resetBoard = useCallback(() => {
    setBoardState({
      size: game.boardSize,
      stones: Array(game.boardSize).fill(null).map(() => Array(game.boardSize).fill(StoneColor.EMPTY)),
      capturedBlack: 0,
      capturedWhite: 0,
    });
    setCurrentMoveIndex(0);
  }, [game.boardSize]);

  const applyMove = useCallback((move: GameMove, currentBoard: BoardState): BoardState => {
    const newBoard = {
      ...currentBoard,
      stones: currentBoard.stones.map(row => [...row]),
    };

    // Skip pass moves (position -1, -1)
    if (move.positionX === -1 && move.positionY === -1) {
      return newBoard;
    }

    // Place stone
    const stoneColor = move.stoneColor === 'black' ? StoneColor.BLACK : StoneColor.WHITE;
    if (move.positionX >= 0 && move.positionX < newBoard.size && 
        move.positionY >= 0 && move.positionY < newBoard.size) {
      newBoard.stones[move.positionY][move.positionX] = stoneColor;
    }

    // Apply captured stones
    if (move.capturedStones) {
      try {
        const captured = JSON.parse(move.capturedStones) as Position[];
        captured.forEach(pos => {
          if (pos.x >= 0 && pos.x < newBoard.size && 
              pos.y >= 0 && pos.y < newBoard.size) {
            const capturedColor = newBoard.stones[pos.y][pos.x];
            newBoard.stones[pos.y][pos.x] = StoneColor.EMPTY;
            
            // Update capture count
            if (capturedColor === StoneColor.BLACK) {
              newBoard.capturedBlack++;
            } else if (capturedColor === StoneColor.WHITE) {
              newBoard.capturedWhite++;
            }
          }
        });
      } catch (error) {
        console.error('Failed to parse captured stones:', error);
      }
    }

    return newBoard;
  }, []);

  const goToMove = useCallback((moveIndex: number) => {
    if (moveIndex < 0 || moveIndex > moves.length) return;

    // Reset board and replay moves up to the target index
    let currentBoard: BoardState = {
      size: game.boardSize,
      stones: Array(game.boardSize).fill(null).map(() => Array(game.boardSize).fill(StoneColor.EMPTY)),
      capturedBlack: 0,
      capturedWhite: 0,
    };

    for (let i = 0; i < moveIndex; i++) {
      currentBoard = applyMove(moves[i], currentBoard);
    }

    setBoardState(currentBoard);
    setCurrentMoveIndex(moveIndex);
  }, [moves, game.boardSize, applyMove]);

  const goToNextMove = useCallback(() => {
    if (currentMoveIndex < moves.length) {
      const nextBoard = applyMove(moves[currentMoveIndex], boardState);
      setBoardState(nextBoard);
      setCurrentMoveIndex(prev => prev + 1);
    }
  }, [currentMoveIndex, moves, boardState, applyMove]);

  const goToPrevMove = useCallback(() => {
    if (currentMoveIndex > 0) {
      goToMove(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, goToMove]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  const getCurrentMove = (): GameMove | null => {
    return currentMoveIndex > 0 ? moves[currentMoveIndex - 1] : null;
  };

  const currentMove = getCurrentMove();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Play className="h-6 w-6" />
              棋谱回放
            </h1>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                关闭回放
              </Button>
            )}
          </div>
          <p className="mt-2 text-gray-600">
            对局时间: {formatDate(game.dateTime)} · 
            时长: {formatTime(game.duration)} · 
            规则: {game.ruleType === 'capture' ? '吃子游戏' : '标准规则'}
          </p>
        </div>

        <div className={cn(
          "grid gap-6",
          isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"
        )}>
          {/* Game Board */}
          <div className={cn(isFullscreen ? "col-span-1" : "lg:col-span-3")}>
            <Card className={cn(isFullscreen && "bg-transparent border-none shadow-none")}>
              <CardContent className={cn("p-6", isFullscreen && "p-0")}>
                <div className="flex justify-center">
                  <GoBoard
                    size={game.boardSize}
                    boardState={boardState}
                    onStonePlace={() => {}} // Disabled for replay
                    onCheckLegalMove={() => false} // All moves disabled
                    showTerritory={false}
                    territoryOwners={new Map()}
                    className="pointer-events-none" // Disable interactions
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={handleToggleFullscreen}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Control Panel */}
            {!isFullscreen && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">回放控制</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* Progress Slider */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>第 {currentMoveIndex} 手</span>
                    <span>共 {moves.length} 手</span>
                  </div>
                  <Slider
                    value={[currentMoveIndex]}
                    onValueChange={([value]) => goToMove(value)}
                    max={moves.length}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetBoard}
                    disabled={currentMoveIndex === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevMove}
                    disabled={currentMoveIndex === 0}
                  >
                    <Rewind className="h-4 w-4" />
                  </Button>

                  <Button
                    variant={isPlaying ? "secondary" : "default"}
                    size="sm"
                    onClick={togglePlay}
                    disabled={currentMoveIndex >= moves.length}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMove}
                    disabled={currentMoveIndex >= moves.length}
                  >
                    <FastForward className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToMove(moves.length)}
                    disabled={currentMoveIndex >= moves.length}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-gray-600">播放速度:</span>
                  {[0.5, 1, 2, 4].map(speed => (
                    <Button
                      key={speed}
                      variant={playSpeed === speed ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPlaySpeed(speed)}
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Game Info Sidebar */}
          {!isFullscreen && (
            <div className="lg:col-span-1 space-y-4">
            {/* Players */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  对局玩家
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-900 rounded-full" />
                    <span className="font-medium">{player1?.nickname || '黑棋'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {game.blackScore || 0}分
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />
                    <span className="font-medium">{player2?.nickname || '白棋'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {game.whiteScore || 0}分
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Move Info */}
            {currentMove && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">当前手数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>手数:</span>
                      <span className="font-medium">第 {currentMove.moveNumber} 手</span>
                    </div>
                    <div className="flex justify-between">
                      <span>执棋:</span>
                      <div className="flex items-center space-x-1">
                        <div className={cn(
                          'w-3 h-3 rounded-full',
                          currentMove.stoneColor === 'black' 
                            ? 'bg-gray-900' 
                            : 'bg-white border border-gray-300'
                        )} />
                        <span className="font-medium text-sm">
                          {currentMove.stoneColor === 'black' ? '黑棋' : '白棋'}
                        </span>
                      </div>
                    </div>
                    {currentMove.positionX !== -1 && currentMove.positionY !== -1 && (
                      <div className="flex justify-between">
                        <span>位置:</span>
                        <span className="font-medium">
                          ({currentMove.positionX + 1}, {currentMove.positionY + 1})
                        </span>
                      </div>
                    )}
                    {currentMove.positionX === -1 && currentMove.positionY === -1 && (
                      <div className="text-center">
                        <Badge variant="secondary">弃权</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  对局统计
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>总手数:</span>
                  <span className="font-medium">{moves.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>黑棋提子:</span>
                  <span className="font-medium">{boardState.capturedWhite}</span>
                </div>
                <div className="flex justify-between">
                  <span>白棋提子:</span>
                  <span className="font-medium">{boardState.capturedBlack}</span>
                </div>
                <div className="flex justify-between">
                  <span>对局结果:</span>
                  <span className="font-medium">
                    {(game.blackScore || 0) > (game.whiteScore || 0) ? '黑胜' : 
                     (game.whiteScore || 0) > (game.blackScore || 0) ? '白胜' : '平局'}
                  </span>
                </div>
              </CardContent>
            </Card>
            </div>
          )}
        </div>

        {/* 全屏模式下的简化控制 */}
        {isFullscreen && (
          <>
            {/* 简化的播放控制 */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetBoard}
                  disabled={currentMoveIndex === 0}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevMove}
                  disabled={currentMoveIndex === 0}
                >
                  <Rewind className="h-4 w-4" />
                </Button>

                <Button
                  variant={isPlaying ? "secondary" : "default"}
                  size="sm"
                  onClick={togglePlay}
                  disabled={currentMoveIndex >= moves.length}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMove}
                  disabled={currentMoveIndex >= moves.length}
                >
                  <FastForward className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToMove(moves.length)}
                  disabled={currentMoveIndex >= moves.length}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 简化的游戏信息 */}
            <div className="fixed top-4 left-4 z-40 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="text-sm space-y-1">
                <div className="font-semibold">
                  第 {currentMoveIndex} 手 / 共 {moves.length} 手
                </div>
                <div className="text-xs text-gray-600">
                  {player1?.nickname || '黑棋'} vs {player2?.nickname || '白棋'}
                </div>
                <div className="text-xs text-gray-600">
                  {game.blackScore || 0} : {game.whiteScore || 0}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}