'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SimpleList } from '@/components/ui/lazy-list';
import { PageLoading } from '@/components/ui/loading-spinner';
import { Game, Player } from '@/lib/db/schema';
import { gameAPI } from '@/lib/api/client';
import { debounce } from '@/lib/utils/performance';
import { 
  History, 
  Play, 
  Clock, 
  Trophy, 
  Search,
  Filter,
  Calendar,
  User
} from 'lucide-react';

interface GameWithPlayers extends Game {
  player1?: Player;
  player2?: Player;
  winner?: Player;
}

export default function HistoryPage() {
  const router = useRouter();
  const [games, setGames] = useState<GameWithPlayers[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySearchTerm, setDisplaySearchTerm] = useState('');
  const [filterRule, setFilterRule] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  // 使用useMemo优化过滤计算
  const filteredGames = useMemo(() => {
    let filtered = [...games];

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.player1?.nickname.toLowerCase().includes(lowerSearchTerm) ||
        game.player2?.nickname.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Rule filter
    if (filterRule !== 'all') {
      filtered = filtered.filter(game => game.ruleType === filterRule);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(game => game.status === filterStatus);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => b.dateTime - a.dateTime);
  }, [games, searchTerm, filterRule, filterStatus]);

  // 防抖搜索函数
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // 使用缓存API加载数据
      const [gamesResponse, playersResponse] = await Promise.all([
        gameAPI.getGameHistory(),
        gameAPI.getPlayers()
      ]);

      if (gamesResponse.error || playersResponse.error) {
        throw new Error(gamesResponse.error || playersResponse.error);
      }

      const gamesData = gamesResponse.data || [];
      const playersData = playersResponse.data || [];
      setPlayers(playersData);

      // 优化数据组合操作
      const playersMap = new Map(playersData.map((p: Player) => [p.id, p]));
      const gamesWithPlayers = gamesData.map((game: Game) => ({
        ...game,
        player1: playersMap.get(game.player1Id),
        player2: playersMap.get(game.player2Id),
        winner: playersMap.get(game.winnerId || 0),
      }));

      setGames(gamesWithPlayers);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN');
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

  const getGameResult = (game: GameWithPlayers): string => {
    if (game.status !== 'finished') {
      return '未完成';
    }

    const blackScore = game.blackScore || 0;
    const whiteScore = game.whiteScore || 0;

    if (blackScore > whiteScore) {
      return '黑胜';
    } else if (whiteScore > blackScore) {
      return '白胜';
    } else {
      return '平局';
    }
  };

  const getResultColor = (game: GameWithPlayers): string => {
    if (game.status !== 'finished') return 'gray';
    
    const blackScore = game.blackScore || 0;
    const whiteScore = game.whiteScore || 0;

    if (blackScore > whiteScore) {
      return 'black';
    } else if (whiteScore > blackScore) {
      return 'white';
    } else {
      return 'gray';
    }
  };

  if (isLoading) {
    return <PageLoading text="加载历史记录中..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <History className="h-8 w-8" />
              历史对局
            </h1>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              返回首页
            </Button>
          </div>
          <p className="mt-2 text-gray-600">查看和回放历史对局记录</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              筛选条件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  搜索玩家
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="输入玩家昵称..."
                    value={displaySearchTerm}
                    onChange={(e) => {
                      setDisplaySearchTerm(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  游戏规则
                </label>
                <select
                  value={filterRule}
                  onChange={(e) => setFilterRule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部规则</option>
                  <option value="capture">吃子游戏</option>
                  <option value="standard">标准规则</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  对局状态
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部状态</option>
                  <option value="finished">已完成</option>
                  <option value="ongoing">进行中</option>
                  <option value="abandoned">已放弃</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games List */}
        <div className="space-y-4">
          {filteredGames.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无符合条件的对局记录</p>
              </CardContent>
            </Card>
          ) : (
            filteredGames.map((game) => (
              <Card key={game.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    {/* Game Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatDate(game.dateTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={game.ruleType === 'capture' ? 'default' : 'secondary'}>
                          {game.ruleType === 'capture' ? '吃子' : '标准'}
                        </Badge>
                        <Badge variant="outline">
                          {game.boardSize}路
                        </Badge>
                        <Badge 
                          variant={game.status === 'finished' ? 'default' : 'secondary'}
                        >
                          {game.status === 'finished' ? '已完成' : 
                           game.status === 'ongoing' ? '进行中' : '已放弃'}
                        </Badge>
                      </div>
                    </div>

                    {/* Players */}
                    <div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-900 rounded-full" />
                          <span className="text-sm font-medium">
                            {game.player1?.nickname || '黑棋'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-white border border-gray-400 rounded-full" />
                          <span className="text-sm font-medium">
                            {game.player2?.nickname || '白棋'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Result & Stats */}
                    <div className="text-center">
                      <div className="text-lg font-bold mb-1">
                        {game.blackScore || 0} : {game.whiteScore || 0}
                      </div>
                      <div className={`text-sm font-medium ${
                        getResultColor(game) === 'black' ? 'text-gray-900' :
                        getResultColor(game) === 'white' ? 'text-gray-600' :
                        'text-gray-500'
                      }`}>
                        {getGameResult(game)}
                      </div>
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDuration(game.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2">
                      {game.status === 'finished' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/replay/${game.id}`)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          回放
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/game?gameId=${game.id}`)}
                        disabled={game.status !== 'ongoing'}
                      >
                        {game.status === 'ongoing' ? '继续' : '查看'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}