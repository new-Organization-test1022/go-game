'use client';

import React from 'react';
import { StoneColor, GameStatus, ScoreInfo } from '@/lib/go/types';
import { Player } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameInfoProps {
  currentPlayer: StoneColor;
  gameStatus: GameStatus;
  player1?: Player;
  player2?: Player;
  scoreInfo?: ScoreInfo;
  gameTime?: number;
  onPass?: () => void;
  onUndo?: () => void;
  onResign?: () => void;
  onRefreshScore?: () => void;
  canUndo?: boolean;
  className?: string;
}

export function GameInfo({
  currentPlayer,
  gameStatus,
  player1,
  player2,
  scoreInfo,
  gameTime = 0,
  onPass,
  onUndo,
  onResign,
  onRefreshScore,
  canUndo = false,
  className,
}: GameInfoProps) {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentPlayerName = (): string => {
    if (currentPlayer === StoneColor.BLACK) {
      return player1?.nickname || '黑棋';
    } else {
      return player2?.nickname || '白棋';
    }
  };

  const getGameStatusText = (): string => {
    switch (gameStatus) {
      case GameStatus.SETUP:
        return '准备中';
      case GameStatus.PLAYING:
        return '进行中';
      case GameStatus.FINISHED:
        return '已结束';
      case GameStatus.PAUSED:
        return '暂停';
      default:
        return '未知';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Player & Game Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">游戏状态</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">状态:</span>
            <span className={cn(
              'px-2 py-1 rounded text-sm font-medium',
              gameStatus === GameStatus.PLAYING 
                ? 'bg-green-100 text-green-800'
                : gameStatus === GameStatus.FINISHED
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            )}>
              {getGameStatusText()}
            </span>
          </div>
          
          {gameStatus === GameStatus.PLAYING && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">当前回合:</span>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'w-4 h-4 rounded-full',
                  currentPlayer === StoneColor.BLACK 
                    ? 'bg-gray-900' 
                    : 'bg-white border-2 border-gray-300'
                )} />
                <span className="font-medium">{getCurrentPlayerName()}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">用时:</span>
            <span className="font-mono">{formatTime(gameTime)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Players Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">对局玩家</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Black Player */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-900 rounded-full" />
              <span className="font-medium">{player1?.nickname || '黑棋玩家'}</span>
            </div>
            <div className="text-sm text-gray-600">
              {player1 && `${player1.winCount}胜 ${player1.loseCount}负`}
            </div>
          </div>
          
          {/* White Player */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />
              <span className="font-medium">{player2?.nickname || '白棋玩家'}</span>
            </div>
            <div className="text-sm text-gray-600">
              {player2 && `${player2.winCount}胜 ${player2.loseCount}负`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Info */}
      {scoreInfo && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">实时目数</CardTitle>
            {onRefreshScore && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshScore}
                className="text-xs"
              >
                刷新
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Black Score */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-900 rounded-full" />
                <span className="font-medium">黑棋</span>
              </div>
              <div className="ml-5 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>地盘:</span>
                  <span>{scoreInfo.blackTerritory}</span>
                </div>
                <div className="flex justify-between">
                  <span>提子:</span>
                  <span>{scoreInfo.blackCaptured}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>总计:</span>
                  <span>{scoreInfo.blackTotal}</span>
                </div>
              </div>
            </div>

            {/* White Score */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded-full" />
                <span className="font-medium">白棋</span>
              </div>
              <div className="ml-5 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>地盘:</span>
                  <span>{scoreInfo.whiteTerritory}</span>
                </div>
                <div className="flex justify-between">
                  <span>提子:</span>
                  <span>{scoreInfo.whiteCaptured}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>总计:</span>
                  <span>{scoreInfo.whiteTotal}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Actions */}
      {gameStatus === GameStatus.PLAYING && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">游戏操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {onPass && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPass}
                  className="text-sm"
                >
                  弃权
                </Button>
              )}
              
              {onUndo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="text-sm"
                >
                  悔棋
                </Button>
              )}
            </div>
            
            {onResign && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onResign}
                className="w-full text-sm"
              >
                认输
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Game Result */}
      {gameStatus === GameStatus.FINISHED && scoreInfo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">对局结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {scoreInfo.blackTotal > scoreInfo.whiteTotal ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-gray-900 rounded-full" />
                    <span className="font-bold text-lg">黑棋获胜</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {scoreInfo.blackTotal} : {scoreInfo.whiteTotal}
                  </div>
                </div>
              ) : scoreInfo.whiteTotal > scoreInfo.blackTotal ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />
                    <span className="font-bold text-lg">白棋获胜</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {scoreInfo.whiteTotal} : {scoreInfo.blackTotal}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="font-bold text-lg">平局</span>
                  <div className="text-sm text-gray-600">
                    {scoreInfo.blackTotal} : {scoreInfo.whiteTotal}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GameInfo;