'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Player } from '@/lib/db/schema';
import { PlayerStatsOverview } from '@/lib/stats/game-stats';
import { getRankByNumericValue } from '@/lib/go/rank';
import { WinRateChart, GameTrendChart, CaptureStatsChart, TimeAnalysisChart } from '@/components/charts';
import {
  User,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Star,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface PlayerStatsPageProps {
  params: { id: string };
}

export default function PlayerStatsPage({ params }: PlayerStatsPageProps) {
  const router = useRouter();
  const playerId = parseInt(params.id);
  
  const [playerStats, setPlayerStats] = useState<PlayerStatsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(playerId)) {
      setError('无效的玩家ID');
      setIsLoading(false);
      return;
    }

    loadPlayerStats();
  }, [playerId]);

  const loadPlayerStats = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/stats/${playerId}`);
      if (!response.ok) {
        throw new Error('Failed to load player stats');
      }
      
      const data = await response.json();
      setPlayerStats(data);
    } catch (error) {
      console.error('Failed to load player stats:', error);
      setError('加载玩家统计失败');
    } finally {
      setIsLoading(false);
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

  const getWinRateColor = (winRate: number): string => {
    if (winRate >= 70) return 'text-green-600';
    if (winRate >= 50) return 'text-blue-600';
    if (winRate >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (winRate: number): string => {
    if (winRate >= 70) return 'bg-green-500';
    if (winRate >= 50) return 'bg-blue-500';
    if (winRate >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载玩家统计中...</p>
        </div>
      </div>
    );
  }

  if (error || !playerStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">
            {error || '玩家数据不存在'}
          </div>
          <Button onClick={() => router.push('/players')}>
            返回玩家列表
          </Button>
        </div>
      </div>
    );
  }

  const { player } = playerStats;
  const playerRank = getRankByNumericValue(player.rank);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-8 w-8" />
                {player.nickname} 的详细档案
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  段位: {playerRank}
                </Badge>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  总场次: {playerStats.totalGames}
                </Badge>
                <Badge 
                  variant="default" 
                  className={`text-base px-3 py-1 ${getWinRateColor(playerStats.winRate)}`}
                >
                  胜率: {playerStats.winRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/players/${playerId}`)}
              >
                个人信息
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/players')}
              >
                返回列表
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Win/Loss Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  胜负统计概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {playerStats.wins}
                    </div>
                    <div className="text-sm text-gray-600">胜利</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {playerStats.losses}
                    </div>
                    <div className="text-sm text-gray-600">失败</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {playerStats.totalGames}
                    </div>
                    <div className="text-sm text-gray-600">总场次</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getWinRateColor(playerStats.winRate)}`}>
                      {playerStats.winRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">胜率</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>胜率进度</span>
                    <span>{playerStats.winRate.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={playerStats.winRate} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rule Type Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    吃子游戏表现
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                      <span className={`font-medium ${getWinRateColor(playerStats.captureGameStats.winRate)}`}>
                        {playerStats.captureGameStats.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-4">
                      <Progress 
                        value={playerStats.captureGameStats.winRate} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    标准规则表现
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                      <span className={`font-medium ${getWinRateColor(playerStats.standardGameStats.winRate)}`}>
                        {playerStats.standardGameStats.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-4">
                      <Progress 
                        value={playerStats.standardGameStats.winRate} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Capture Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  提子统计分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {playerStats.totalCapturedStones}
                    </div>
                    <div className="text-sm text-gray-600">总提子数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {playerStats.totalLostStones}
                    </div>
                    <div className="text-sm text-gray-600">总失子数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {playerStats.totalCapturedStones - playerStats.totalLostStones > 0 ? '+' : ''}
                      {playerStats.totalCapturedStones - playerStats.totalLostStones}
                    </div>
                    <div className="text-sm text-gray-600">净提子数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {playerStats.totalGames > 0 ? 
                        (playerStats.totalCapturedStones / playerStats.totalGames).toFixed(1) : '0'}
                    </div>
                    <div className="text-sm text-gray-600">场均提子</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            {/* Player Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  玩家信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>昵称:</span>
                  <span className="font-medium">{player.nickname}</span>
                </div>
                <div className="flex justify-between">
                  <span>当前段位:</span>
                  <Badge variant="outline">{playerRank}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>连胜:</span>
                  <span className="font-medium text-green-600">
                    {player.consecutiveWins}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>连败:</span>
                  <span className="font-medium text-red-600">
                    {player.consecutiveLosses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>总用时:</span>
                  <span className="font-medium">
                    {formatDuration(player.totalTime)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Time Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  时间统计
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>平均时长:</span>
                  <span className="font-medium">
                    {formatDuration(playerStats.averageDuration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>总游戏时间:</span>
                  <span className="font-medium">
                    {formatDuration(player.totalTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>注册时间:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(player.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>最后更新:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(player.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  成就徽章
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {playerStats.winRate >= 70 && (
                  <Badge className="w-full justify-center" variant="default">
                    🏆 高胜率大师 (70%+)
                  </Badge>
                )}
                {playerStats.totalGames >= 100 && (
                  <Badge className="w-full justify-center" variant="secondary">
                    🎯 百场达人 (100+场)
                  </Badge>
                )}
                {player.consecutiveWins >= 5 && (
                  <Badge className="w-full justify-center" variant="default">
                    🔥 连胜王者 ({player.consecutiveWins}连胜)
                  </Badge>
                )}
                {playerStats.totalCapturedStones >= 1000 && (
                  <Badge className="w-full justify-center" variant="outline">
                    ⚔️ 提子专家 (1000+)
                  </Badge>
                )}
                {playerStats.totalGames === 0 && (
                  <div className="text-center text-gray-500 text-sm">
                    暂无成就徽章
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            数据可视化分析
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                  playerId={playerId}
                  title="胜率趋势分析"
                />
              </CardContent>
            </Card>
          </div>

          {/* Capture Stats Chart */}
          <Card className="mb-6">
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
          <Card>
            <CardContent className="p-6">
              <TimeAnalysisChart
                games={playerStats.recentGames}
                averageDuration={playerStats.averageDuration}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}