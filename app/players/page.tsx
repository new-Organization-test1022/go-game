'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '@/lib/db/schema';

interface PlayerStats extends Player {
  totalGames: number;
  winRate: number;
  averageGameTime: number;
}

export default function PlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load players
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/players');
      if (!response.ok) {
        throw new Error('Failed to load players');
      }
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to load players:', error);
      setError('加载玩家列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new player
  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) {
      setError('请输入玩家昵称');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: newPlayerName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create player');
      }

      const newPlayer = await response.json();
      setPlayers(prev => [newPlayer, ...prev]);
      setNewPlayerName('');
    } catch (error: any) {
      console.error('Failed to create player:', error);
      setError(error.message || '创建玩家失败');
    } finally {
      setIsCreating(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载玩家列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">玩家管理</h1>
            <Button
              variant="outline"
              onClick={() => router.push('/setup')}
            >
              开始游戏
            </Button>
          </div>
          <p className="mt-2 text-gray-600">管理玩家信息和查看统计数据</p>
        </div>

        {/* Add New Player */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>添加新玩家</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="输入玩家昵称"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePlayer();
                  }
                }}
                disabled={isCreating}
              />
              <Button
                onClick={handleCreatePlayer}
                disabled={isCreating || !newPlayerName.trim()}
              >
                {isCreating ? '创建中...' : '添加'}
              </Button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle>玩家列表 ({players.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">还没有玩家</p>
                <p className="text-sm text-gray-400">添加第一个玩家开始游戏吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{player.nickname}</h3>
                      <div className="mt-1 text-sm text-gray-600 space-y-1">
                        <div className="flex space-x-4">
                          <span>胜负: {player.winCount}胜 {player.loseCount}负</span>
                          <span>
                            胜率: {
                              player.winCount + player.loseCount > 0
                                ? Math.round((player.winCount / (player.winCount + player.loseCount)) * 100)
                                : 0
                            }%
                          </span>
                        </div>
                        <div className="flex space-x-4">
                          <span>总对局: {player.winCount + player.loseCount}</span>
                          <span>总用时: {formatTime(player.totalTime)}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          创建时间: {new Date(player.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/players/${player.id}`)}
                      >
                        详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        {players.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>统计概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {players.length}
                  </div>
                  <div className="text-sm text-gray-600">总玩家数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {players.reduce((sum, p) => sum + p.winCount + p.loseCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">总对局数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(players.reduce((sum, p) => sum + p.totalTime, 0))}
                  </div>
                  <div className="text-sm text-gray-600">总游戏时长</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {players.length > 0 
                      ? Math.round(players.reduce((sum, p) => sum + p.winCount + p.loseCount, 0) / players.length)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600">平均对局数</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}