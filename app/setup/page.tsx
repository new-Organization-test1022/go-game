'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Player } from '@/lib/db/schema';
import { RuleType, BoardSize } from '@/lib/go/types';

export default function SetupPage() {
  const router = useRouter();
  
  // Setup state
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<number | null>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<number | null>(null);
  const [boardSize, setBoardSize] = useState<number>(19);
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.STANDARD);
  const [isLoading, setIsLoading] = useState(true);
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
      
      // Auto-select first two players if available
      if (data.length >= 2) {
        setSelectedPlayer1(data[0].id);
        setSelectedPlayer2(data[1].id);
      } else if (data.length === 1) {
        setSelectedPlayer1(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load players:', error);
      setError('加载玩家列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      setError('请选择两名玩家');
      return;
    }

    if (selectedPlayer1 === selectedPlayer2) {
      setError('请选择不同的玩家');
      return;
    }

    // Navigate to game page with parameters
    const params = new URLSearchParams({
      size: boardSize.toString(),
      rule: ruleType,
      player1: selectedPlayer1.toString(),
      player2: selectedPlayer2.toString(),
    });

    router.push(`/game?${params.toString()}`);
  };

  const canStartGame = () => {
    return selectedPlayer1 && selectedPlayer2 && selectedPlayer1 !== selectedPlayer2;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载设置页面中...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">游戏设置</h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push('/players')}
              >
                玩家管理
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                返回首页
              </Button>
            </div>
          </div>
          <p className="mt-2 text-gray-600">选择玩家和游戏规则开始对局</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Selection */}
          <Card>
            <CardHeader>
              <CardTitle>选择玩家</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {players.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">还没有玩家</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/players')}
                  >
                    添加玩家
                  </Button>
                </div>
              ) : (
                <>
                  {/* Black Player (Player 1) */}
                  <div>
                    <Label className="text-base font-medium">黑棋玩家</Label>
                    <RadioGroup
                      value={selectedPlayer1?.toString() || ''}
                      onValueChange={(value) => setSelectedPlayer1(parseInt(value))}
                      className="mt-2"
                    >
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={player.id.toString()}
                            id={`player1-${player.id}`}
                          />
                          <Label
                            htmlFor={`player1-${player.id}`}
                            className="flex-1 cursor-pointer p-2 rounded hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-gray-900 rounded-full" />
                              <span className="font-medium">{player.nickname}</span>
                              <span className="text-sm text-gray-500">
                                ({player.winCount}胜{player.loseCount}负)
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* White Player (Player 2) */}
                  <div>
                    <Label className="text-base font-medium">白棋玩家</Label>
                    <RadioGroup
                      value={selectedPlayer2?.toString() || ''}
                      onValueChange={(value) => setSelectedPlayer2(parseInt(value))}
                      className="mt-2"
                    >
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={player.id.toString()}
                            id={`player2-${player.id}`}
                          />
                          <Label
                            htmlFor={`player2-${player.id}`}
                            className="flex-1 cursor-pointer p-2 rounded hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />
                              <span className="font-medium">{player.nickname}</span>
                              <span className="text-sm text-gray-500">
                                ({player.winCount}胜{player.loseCount}负)
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Game Settings */}
          <Card>
            <CardHeader>
              <CardTitle>游戏设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Board Size */}
              <div>
                <Label className="text-base font-medium">棋盘规格</Label>
                <RadioGroup
                  value={boardSize.toString()}
                  onValueChange={(value) => setBoardSize(parseInt(value))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="13" id="size-13" />
                    <Label htmlFor="size-13" className="cursor-pointer">
                      13路棋盘 (13×13, 169个交点)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="19" id="size-19" />
                    <Label htmlFor="size-19" className="cursor-pointer">
                      19路棋盘 (19×19, 361个交点)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Rule Type */}
              <div>
                <Label className="text-base font-medium">规则类型</Label>
                <RadioGroup
                  value={ruleType}
                  onValueChange={(value) => setRuleType(value as RuleType)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={RuleType.STANDARD} id="rule-standard" />
                    <Label htmlFor="rule-standard" className="cursor-pointer">
                      <div>
                        <div className="font-medium">标准规则</div>
                        <div className="text-sm text-gray-500">
                          完整围棋规则，包含地盘计算
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={RuleType.CAPTURE} id="rule-capture" />
                    <Label htmlFor="rule-capture" className="cursor-pointer">
                      <div>
                        <div className="font-medium">吃子游戏</div>
                        <div className="text-sm text-gray-500">
                          以提取对方棋子为目标
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Preview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>对局预览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">黑棋玩家:</span>
                  <span className="font-medium">
                    {selectedPlayer1 
                      ? players.find(p => p.id === selectedPlayer1)?.nickname 
                      : '未选择'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">白棋玩家:</span>
                  <span className="font-medium">
                    {selectedPlayer2 
                      ? players.find(p => p.id === selectedPlayer2)?.nickname 
                      : '未选择'
                    }
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">棋盘规格:</span>
                  <span className="font-medium">{boardSize}路棋盘</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">规则类型:</span>
                  <span className="font-medium">
                    {ruleType === RuleType.STANDARD ? '标准规则' : '吃子游戏'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Game Button */}
        <div className="mt-6 text-center">
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={!canStartGame()}
            className="px-8 py-3 text-lg"
          >
            开始对局
          </Button>
          {!canStartGame() && players.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              请选择两名不同的玩家开始游戏
            </p>
          )}
        </div>
      </div>
    </div>
  );
}