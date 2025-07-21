'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Player } from '@/lib/db/schema';
import { RuleType, BoardSize, GameType, AIDifficulty } from '@/lib/go/types';
import { Bot, User, Users } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  
  // Setup state
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<number | null>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<number | null>(null);
  const [gameType, setGameType] = useState<GameType>(GameType.HUMAN_VS_HUMAN);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(AIDifficulty.BEGINNER_30K);
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
    if (!selectedPlayer1) {
      setError('请选择玩家');
      return;
    }

    if (gameType === GameType.HUMAN_VS_HUMAN) {
      if (!selectedPlayer2) {
        setError('请选择第二名玩家');
        return;
      }
      if (selectedPlayer1 === selectedPlayer2) {
        setError('请选择不同的玩家');
        return;
      }
    }

    // Navigate to game page with parameters
    const params = new URLSearchParams({
      size: boardSize.toString(),
      rule: ruleType,
      player1: selectedPlayer1.toString(),
      gameType: gameType,
    });

    if (gameType === GameType.HUMAN_VS_HUMAN && selectedPlayer2) {
      params.set('player2', selectedPlayer2.toString());
    } else if (gameType === GameType.HUMAN_VS_AI) {
      params.set('aiDifficulty', aiDifficulty);
    }

    router.push(`/game?${params.toString()}`);
  };

  const canStartGame = () => {
    if (!selectedPlayer1) return false;
    
    if (gameType === GameType.HUMAN_VS_HUMAN) {
      return selectedPlayer2 && selectedPlayer1 !== selectedPlayer2;
    } else {
      return true; // AI battles only need one player
    }
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

        {/* Battle Mode Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              对战模式
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={gameType}
              onValueChange={(value) => {
                setGameType(value as GameType);
                setError(null);
                if (value === GameType.HUMAN_VS_AI) {
                  setSelectedPlayer2(null); // Clear player 2 selection for AI mode
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={GameType.HUMAN_VS_HUMAN} id="mode-human" />
                <Label htmlFor="mode-human" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-semibold text-base">人人对战</div>
                      <div className="text-sm text-gray-600">与其他玩家进行对局</div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={GameType.HUMAN_VS_AI} id="mode-ai" />
                <Label htmlFor="mode-ai" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-base">人机对战</div>
                      <div className="text-sm text-gray-600">与AI进行对局练习</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {/* AI Difficulty Selection */}
            {gameType === GameType.HUMAN_VS_AI && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Label className="text-base font-medium mb-3 block">
                  <Bot className="inline h-4 w-4 mr-2" />
                  AI难度级别
                </Label>
                <RadioGroup
                  value={aiDifficulty}
                  onValueChange={(value) => setAiDifficulty(value as AIDifficulty)}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.BEGINNER_30K} id="ai-30k" />
                    <Label htmlFor="ai-30k" className="cursor-pointer text-sm">30K (初学)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.BEGINNER_20K} id="ai-20k" />
                    <Label htmlFor="ai-20k" className="cursor-pointer text-sm">20K</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.BEGINNER_10K} id="ai-10k" />
                    <Label htmlFor="ai-10k" className="cursor-pointer text-sm">10K</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.BEGINNER_5K} id="ai-5k" />
                    <Label htmlFor="ai-5k" className="cursor-pointer text-sm">5K</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.INTERMEDIATE_1K} id="ai-1k" />
                    <Label htmlFor="ai-1k" className="cursor-pointer text-sm">1K (中级)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.INTERMEDIATE_1D} id="ai-1d" />
                    <Label htmlFor="ai-1d" className="cursor-pointer text-sm">1段</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.INTERMEDIATE_3D} id="ai-3d" />
                    <Label htmlFor="ai-3d" className="cursor-pointer text-sm">3段</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.ADVANCED_7D} id="ai-7d" />
                    <Label htmlFor="ai-7d" className="cursor-pointer text-sm">7段 (高级)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.PROFESSIONAL_1P} id="ai-1p" />
                    <Label htmlFor="ai-1p" className="cursor-pointer text-sm">专业1段</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.PROFESSIONAL_5P} id="ai-5p" />
                    <Label htmlFor="ai-5p" className="cursor-pointer text-sm">专业5段</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AIDifficulty.PROFESSIONAL_9P} id="ai-9p" />
                    <Label htmlFor="ai-9p" className="cursor-pointer text-sm">专业9段 (顶级)</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

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

                  {/* White Player (Player 2) - Only show in human vs human mode */}
                  {gameType === GameType.HUMAN_VS_HUMAN && (
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
                  )}
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
                  <span className="text-gray-600">对战模式:</span>
                  <span className="font-medium flex items-center gap-1">
                    {gameType === GameType.HUMAN_VS_HUMAN ? (
                      <><Users className="h-4 w-4" /> 人人对战</>
                    ) : (
                      <><Bot className="h-4 w-4" /> 人机对战</>
                    )}
                  </span>
                </div>
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
                    {gameType === GameType.HUMAN_VS_HUMAN ? (
                      selectedPlayer2 
                        ? players.find(p => p.id === selectedPlayer2)?.nickname 
                        : '未选择'
                    ) : (
                      `AI ${aiDifficulty}`
                    )}
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
                {gameType === GameType.HUMAN_VS_AI && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI难度:</span>
                    <span className="font-medium">{aiDifficulty}</span>
                  </div>
                )}
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
              {gameType === GameType.HUMAN_VS_HUMAN 
                ? '请选择两名不同的玩家开始游戏'
                : '请选择一名玩家开始人机对战'
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}