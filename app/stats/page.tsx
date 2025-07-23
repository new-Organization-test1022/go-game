'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/lib/db/schema';
import { PlayerStatsOverview, DetailedGameStats } from '@/lib/stats/game-stats';
import { BarChart3, Clock, Trophy, Target, Users, TrendingUp } from 'lucide-react';
import { WinRateChart, GameTrendChart, CaptureStatsChart, TimeAnalysisChart } from '@/components/charts';

interface GlobalStats {
  totalGames: number;
  averageDuration: number;
  longestGame: number;
}

export default function StatsPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStatsOverview | null>(null);
  const [recentGames, setRecentGames] = useState<DetailedGameStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载玩家列表
  useEffect(() => {
    loadPlayers();
    loadGlobalStats();
  }, []);

  // 当选择玩家时加载统计数据
  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerStats(selectedPlayer.id);
    }
  }, [selectedPlayer]);

  const loadPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
        if (data.length > 0) {
          setSelectedPlayer(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load players:', error);
      setError('加载玩家列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGlobalStats = async () => {
    try {
      const response = await fetch('/api/stats/games');
      if (response.ok) {
        const data = await response.json();
        setGlobalStats(data.globalStats);
        setRecentGames(data.recentGames);
      }
    } catch (error) {
      console.error('Failed to load global stats:', error);
    }
  };

  const loadPlayerStats = async (playerId: number) => {
    try {
      const response = await fetch(`/api/stats/${playerId}`);
      if (response.ok) {
        const data = await response.json();
        setPlayerStats(data);
      } else {
        setError('加载玩家统计失败');
      }
    } catch (error) {
      console.error('Failed to load player stats:', error);
      setError('加载玩家统计失败');
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载统计数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              统计数据
            </h1>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              返回首页
            </Button>
          </div>
          <p className="mt-2 text-gray-600">查看详细的对局统计和分析</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  总对局数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats.totalGames}</div>
                <p className="text-sm text-gray-600">已完成对局</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  平均时长
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(globalStats.averageDuration)}</div>
                <p className="text-sm text-gray-600">每局平均</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  最长对局
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(globalStats.longestGame)}</div>
                <p className="text-sm text-gray-600">历史记录</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  选择玩家
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map((player) => (
                    <Button
                      key={player.id}
                      variant={selectedPlayer?.id === player.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{player.nickname}</span>
                        <div className="text-xs text-gray-500">
                          {player.winCount}胜 {player.loseCount}负
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Stats */}
          <div className="lg:col-span-2">
            {playerStats && (
              <div className="space-y-4">
                {/* Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {playerStats.player.nickname} 的统计概览
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {playerStats.wins}
                        </div>
                        <div className="text-sm text-gray-600">胜利</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {playerStats.losses}
                        </div>
                        <div className="text-sm text-gray-600">失败</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {playerStats.winRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">胜率</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatDuration(playerStats.averageDuration)}
                        </div>
                        <div className="text-sm text-gray-600">平均时长</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rule Type Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">吃子游戏统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>胜利:</span>
                          <span className="font-medium text-green-600">
                            {playerStats.captureGameStats.wins}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>失败:</span>
                          <span className="font-medium text-red-600">
                            {playerStats.captureGameStats.losses}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>胜率:</span>
                          <span className="font-medium text-blue-600">
                            {playerStats.captureGameStats.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">标准规则统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>胜利:</span>
                          <span className="font-medium text-green-600">
                            {playerStats.standardGameStats.wins}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>失败:</span>
                          <span className="font-medium text-red-600">
                            {playerStats.standardGameStats.losses}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>胜率:</span>
                          <span className="font-medium text-blue-600">
                            {playerStats.standardGameStats.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Capture Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">提子统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {playerStats.totalCapturedStones}
                        </div>
                        <div className="text-sm text-gray-600">总提子数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">
                          {playerStats.totalLostStones}
                        </div>
                        <div className="text-sm text-gray-600">总失子数</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Win Rate Chart */}
                  <Card>
                    <CardContent className="p-6">
                      <WinRateChart 
                        wins={playerStats.wins}
                        losses={playerStats.losses}
                        title="总体胜负分布"
                      />
                    </CardContent>
                  </Card>

                  {/* Game Trend Chart */}
                  <Card>
                    <CardContent className="p-6">
                      <GameTrendChart 
                        games={playerStats.recentGames}
                        playerId={selectedPlayer.id}
                        title="胜率趋势"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Capture Stats Chart */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <CaptureStatsChart
                      totalCaptured={playerStats.totalCapturedStones}
                      totalLost={playerStats.totalLostStones}
                      captureGameStats={playerStats.captureGameStats}
                      standardGameStats={playerStats.standardGameStats}
                    />
                  </CardContent>
                </Card>

                {/* Time Analysis Chart */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <TimeAnalysisChart
                      games={playerStats.recentGames}
                      averageDuration={playerStats.averageDuration}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                最近对局
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">日期</th>
                      <th className="text-left p-2">玩家</th>
                      <th className="text-left p-2">规则</th>
                      <th className="text-left p-2">时长</th>
                      <th className="text-left p-2">分数</th>
                      <th className="text-left p-2">结果</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGames.map((game) => (
                      <tr key={game.gameId} className="border-b hover:bg-gray-50">
                        <td className="p-2">{formatDate(game.dateTime)}</td>
                        <td className="p-2">{game.player1.nickname}</td>
                        <td className="p-2">
                          <Badge variant={game.ruleType === 'capture' ? 'default' : 'secondary'}>
                            {game.ruleType === 'capture' ? '吃子' : '标准'}
                          </Badge>
                        </td>
                        <td className="p-2">{formatDuration(game.duration)}</td>
                        <td className="p-2">
                          {game.blackScore} : {game.whiteScore}
                        </td>
                        <td className="p-2">
                          {game.blackScore > game.whiteScore ? '黑胜' : 
                           game.whiteScore > game.blackScore ? '白胜' : '平局'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}