'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '@/lib/db/schema';
import { Trash2, AlertTriangle } from 'lucide-react';

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
  
  // Delete-related state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{ gamesCount: number; reason?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle delete player confirmation
  const handleDeleteClick = async (player: Player) => {
    try {
      // Check if player can be deleted and get game count
      const response = await fetch(`/api/players/${player.id}`);
      if (response.ok) {
        const playerData = await response.json();
        setPlayerToDelete(player);
        setDeleteInfo({
          gamesCount: playerData.totalGames || 0,
          reason: playerData.totalGames > 0 ? `删除此玩家将同时删除 ${playerData.totalGames} 条相关对局记录` : undefined
        });
        setDeleteDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to get player info:', error);
      setError('获取玩家信息失败');
    }
  };

  // Confirm delete player
  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/players/${playerToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete player');
      }

      const result = await response.json();
      
      // Remove player from list
      setPlayers(prev => prev.filter(p => p.id !== playerToDelete.id));
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setPlayerToDelete(null);
      setDeleteInfo(null);
      
      // Show success message briefly
      setError(null);
    } catch (error: any) {
      console.error('Failed to delete player:', error);
      setError(error.message || '删除玩家失败');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setPlayerToDelete(null);
    setDeleteInfo(null);
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(player)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
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
        
        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">确认删除玩家</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  您确定要删除玩家 <strong>{playerToDelete?.nickname}</strong> 吗？
                </p>
                
                {deleteInfo?.reason && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">注意！</p>
                        <p className="text-sm text-yellow-700 mt-1">{deleteInfo.reason}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-gray-500 mt-3">
                  此操作不可恢复。
                </p>
              </div>
              
              <div className="flex space-x-3 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeletePlayer}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? '删除中...' : '确认删除'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}