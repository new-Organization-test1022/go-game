'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Clock, Target } from 'lucide-react';

interface PlayerStats {
  id: number;
  nickname: string;
  winCount: number;
  loseCount: number;
  totalTime: number;
  createdAt: number;
  updatedAt: number;
  totalGames: number;
  winRate: number;
  averageGameTime: number;
}

interface Game {
  id: number;
  player1Id: number;
  player2Id: number;
  boardSize: number;
  ruleType: string;
  winnerId?: number;
  duration: number;
  dateTime: number;
  status: string;
  blackScore?: number;
  whiteScore?: number;
}

export default function PlayerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = parseInt(params.id as string);

  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playerId) {
      loadPlayerData();
    }
  }, [playerId]);

  const loadPlayerData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load player stats
      const [playerResponse, gamesResponse] = await Promise.all([
        fetch(`/api/players/${playerId}`),
        fetch('/api/games')
      ]);

      if (!playerResponse.ok) {
        throw new Error('Failed to load player data');
      }

      const playerData = await playerResponse.json();
      setPlayerStats(playerData);

      if (gamesResponse.ok) {
        const allGames = await gamesResponse.json();
        // Filter games for this player
        const playerGames = allGames.filter((game: Game) => 
          game.player1Id === playerId || game.player2Id === playerId
        );
        setGames(playerGames);
      }
    } catch (error) {
      console.error('Failed to load player data:', error);
      setError('加载玩家数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0分钟';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGameResultForPlayer = (game: Game): string => {
    if (game.status !== 'finished' || !game.winnerId) {
      return '进行中';
    }
    
    if (game.winnerId === playerId) {
      return '胜';
    } else {
      return '负';
    }
  };

  const getOpponentInfo = (game: Game): string => {
    // In a real app, you'd fetch player names from the API
    const opponentId = game.player1Id === playerId ? game.player2Id : game.player1Id;
    return `对手 #${opponentId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载玩家数据中...</p>
        </div>
      </div>
    );
  }

  if (error || !playerStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '玩家未找到'}</p>
          <Button onClick={() => router.push('/players')}>
            返回玩家列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/players')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回玩家列表
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {playerStats.nickname}
          </h1>
          <p className="mt-2 text-gray-600">
            玩家详细信息和对局历史
          </p>
        </div>

        {/* Player Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">胜率</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {playerStats.winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {playerStats.winCount}胜 {playerStats.loseCount}负
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总对局数</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {playerStats.totalGames}
              </div>
              <p className="text-xs text-muted-foreground">
                已完成对局
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">游戏时长</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTime(playerStats.totalTime)}
              </div>
              <p className="text-xs text-muted-foreground">
                累计对局时间
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>详细统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-gray-600">加入时间</div>
                <div className="font-medium">
                  {formatDate(playerStats.createdAt)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-600">最后活动</div>
                <div className="font-medium">
                  {formatDate(playerStats.updatedAt)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-600">平均用时</div>
                <div className="font-medium">
                  {formatTime(playerStats.averageGameTime)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-600">胜负差</div>
                <div className="font-medium">
                  {playerStats.winCount - playerStats.loseCount > 0 ? '+' : ''}
                  {playerStats.winCount - playerStats.loseCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game History */}
        <Card>
          <CardHeader>
            <CardTitle>对局历史 ({games.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {games.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">还没有对局记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {games.slice(0, 10).map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          getGameResultForPlayer(game) === '胜'
                            ? 'bg-green-100 text-green-800'
                            : getGameResultForPlayer(game) === '负'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getGameResultForPlayer(game)}
                        </span>
                        <span className="font-medium">
                          {game.boardSize}路 · {game.ruleType === 'standard' ? '标准' : '吃子'}
                        </span>
                        <span className="text-sm text-gray-600">
                          vs {getOpponentInfo(game)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 space-x-3">
                        <span>{formatDate(game.dateTime)}</span>
                        <span>用时: {formatTime(game.duration)}</span>
                        {game.blackScore !== undefined && game.whiteScore !== undefined && (
                          <span>比分: {game.blackScore}:{game.whiteScore}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/games/${game.id}`)}
                    >
                      查看
                    </Button>
                  </div>
                ))}
                
                {games.length > 10 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      仅显示最近10局，共{games.length}局对局
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}