'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Player } from '@/lib/db/schema';
import { RuleType, BoardSize, GameType, AIDifficulty } from '@/lib/go/types';
import { getAIDescription, getAIShortDescription, canChallengeAI, getRecommendedAI, getAITrainingPlan } from '@/lib/go/ai-descriptions';
import { getRankByNumericValue } from '@/lib/go/rank';
import { AIGuide } from '@/components/ui/ai-guide';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Users, HelpCircle, Trophy, Target } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  
  // Setup state
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<number | null>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<number | null>(null);
  const [gameType, setGameType] = useState<GameType>(GameType.HUMAN_VS_HUMAN);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(AIDifficulty.AI_30K);
  const [boardSize, setBoardSize] = useState<number>(19);
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.STANDARD);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIGuide, setShowAIGuide] = useState(false);

  // AI描述获取函数
  const getAIDisplayName = (difficulty: AIDifficulty): string => {
    const aiDesc = getAIDescription(difficulty);
    return aiDesc.name;
  };

  const getAIDescriptionText = (difficulty: AIDifficulty): string => {
    return getAIShortDescription(difficulty);
  };

  // 获取当前选中玩家的AI推荐
  const getPlayerAIRecommendations = () => {
    if (!selectedPlayer1) return null;
    const player = players.find(p => p.id === selectedPlayer1);
    if (!player) return null;
    
    return {
      recommendations: getRecommendedAI(player.rank),
      trainingPlan: getAITrainingPlan(player.rank),
      playerRank: getRankByNumericValue(player.rank)
    };
  };

  // 检查AI挑战是否合适
  const checkAIChallenge = (difficulty: AIDifficulty) => {
    if (!selectedPlayer1) return { canChallenge: true, difficulty: 'normal' as const };
    const player = players.find(p => p.id === selectedPlayer1);
    if (!player) return { canChallenge: true, difficulty: 'normal' as const };
    
    return canChallengeAI(player.rank, difficulty);
  };
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
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">
                    <Bot className="inline h-4 w-4 mr-2" />
                    AI难度级别
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIGuide(true)}
                    className="flex items-center gap-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                    AI能力指南
                  </Button>
                </div>
                
                {/* 初学者级别 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🟢 初学者级别 (30K-20K)</h4>
                  <RadioGroup
                    value={aiDifficulty}
                    onValueChange={(value) => setAiDifficulty(value as AIDifficulty)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-green-100">
                      <RadioGroupItem value={AIDifficulty.AI_30K} id="ai-30k" />
                      <Label htmlFor="ai-30k" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-30K (入门)</div>
                        <div className="text-xs text-gray-500">刚学会基本规则，容易出错</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-green-100">
                      <RadioGroupItem value={AIDifficulty.AI_25K} id="ai-25k" />
                      <Label htmlFor="ai-25k" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-25K (基础)</div>
                        <div className="text-xs text-gray-500">会简单提子做眼，大局观弱</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-green-100">
                      <RadioGroupItem value={AIDifficulty.AI_20K} id="ai-20k" />
                      <Label htmlFor="ai-20k" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-20K (进阶)</div>
                        <div className="text-xs text-gray-500">识别基本定式，有布局思路</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* 进阶级别 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🟡 进阶级别 (15K-5K)</h4>
                  <RadioGroup
                    value={aiDifficulty}
                    onValueChange={(value) => setAiDifficulty(value as AIDifficulty)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-yellow-100">
                      <RadioGroupItem value={AIDifficulty.AI_15K} id="ai-15k" />
                      <Label htmlFor="ai-15k" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-15K (布局)</div>
                        <div className="text-xs text-gray-500">有大局观，主动做活</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-yellow-100">
                      <RadioGroupItem value={AIDifficulty.AI_10K} id="ai-10k" />
                      <Label htmlFor="ai-10k" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-10K (实用)</div>
                        <div className="text-xs text-gray-500">布局合理，能做劫争</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-yellow-100">
                      <RadioGroupItem value={AIDifficulty.AI_5K} id="ai-5k" />
                      <Label htmlFor="ai-5k" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-5K (技巧)</div>
                        <div className="text-xs text-gray-500">具备收官能力，攻防兼备</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* 中级级别 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🟠 中级级别 (1K-3D)</h4>
                  <RadioGroup
                    value={aiDifficulty}
                    onValueChange={(value) => setAiDifficulty(value as AIDifficulty)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-orange-100">
                      <RadioGroupItem value={AIDifficulty.AI_1K} id="ai-1k" />
                      <Label htmlFor="ai-1k" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-1K (段位冲刺)</div>
                        <div className="text-xs text-gray-500">复杂定式，攻防转换</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-orange-100">
                      <RadioGroupItem value={AIDifficulty.AI_1D} id="ai-1d" />
                      <Label htmlFor="ai-1d" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-1D (业余初段)</div>
                        <div className="text-xs text-gray-500">全局观提升，主动布局</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-orange-100">
                      <RadioGroupItem value={AIDifficulty.AI_2D} id="ai-2d" />
                      <Label htmlFor="ai-2d" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-2D (稳固提升)</div>
                        <div className="text-xs text-gray-500">形势判断精确，理解厚薄</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-orange-100">
                      <RadioGroupItem value={AIDifficulty.AI_3D} id="ai-3d" />
                      <Label htmlFor="ai-3d" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-3D (高段挑战)</div>
                        <div className="text-xs text-gray-500">高级定式，精确计算</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* 高级级别 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🔴 高级级别 (4D-7D)</h4>
                  <RadioGroup
                    value={aiDifficulty}
                    onValueChange={(value) => setAiDifficulty(value as AIDifficulty)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-red-100">
                      <RadioGroupItem value={AIDifficulty.AI_4D} id="ai-4d" />
                      <Label htmlFor="ai-4d" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-4D (专业进阶)</div>
                        <div className="text-xs text-gray-500">战略思考深入，布局创新</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-red-100">
                      <RadioGroupItem value={AIDifficulty.AI_5D} id="ai-5d" />
                      <Label htmlFor="ai-5d" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-5D (准职业)</div>
                        <div className="text-xs text-gray-500">接近职业级别，计算超强</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-red-100">
                      <RadioGroupItem value={AIDifficulty.AI_6D} id="ai-6d" />
                      <Label htmlFor="ai-6d" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-6D (艺术大师)</div>
                        <div className="text-xs text-gray-500">棋艺达到艺术级别</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-red-100">
                      <RadioGroupItem value={AIDifficulty.AI_7D} id="ai-7d" />
                      <Label htmlFor="ai-7d" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-7D (技艺巅峰)</div>
                        <div className="text-xs text-gray-500">技艺达到巅峰，蕴含哲学</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* 专业级别 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">⚫ 专业级别 (1P-9P)</h4>
                  <RadioGroup
                    value={aiDifficulty}
                    onValueChange={(value) => setAiDifficulty(value as AIDifficulty)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-100">
                      <RadioGroupItem value={AIDifficulty.AI_1P} id="ai-1p" />
                      <Label htmlFor="ai-1p" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-1P (职业入门)</div>
                        <div className="text-xs text-gray-500">职业级别，几乎不犯错</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-100">
                      <RadioGroupItem value={AIDifficulty.AI_3P} id="ai-3p" />
                      <Label htmlFor="ai-3p" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-3P (职业精英)</div>
                        <div className="text-xs text-gray-500">精英水平，近乎完美</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-100">
                      <RadioGroupItem value={AIDifficulty.AI_5P} id="ai-5p" />
                      <Label htmlFor="ai-5p" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-5P (超级大师)</div>
                        <div className="text-xs text-gray-500">大师级洞察，超越人类</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-100">
                      <RadioGroupItem value={AIDifficulty.AI_7P} id="ai-7p" />
                      <Label htmlFor="ai-7p" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-7P (传奇级别)</div>
                        <div className="text-xs text-gray-500">传奇能力，重新定义围棋</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-100">
                      <RadioGroupItem value={AIDifficulty.AI_9P} id="ai-9p" />
                      <Label htmlFor="ai-9p" className="cursor-pointer text-sm flex-1">
                        <div className="font-medium">AI-9P (围棋之神)</div>
                        <div className="text-xs text-gray-500">神级表现，围棋终极形态</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* AI挑战验证和建议 */}
                {selectedPlayer1 && (() => {
                  const challenge = checkAIChallenge(aiDifficulty);
                  const recommendations = getPlayerAIRecommendations();
                  
                  return (
                    <div className="mt-4 space-y-3">
                      {/* 挑战验证结果 */}
                      <div className={`p-3 rounded border ${
                        challenge.canChallenge 
                          ? challenge.difficulty === 'easy' 
                            ? 'bg-green-50 border-green-200' 
                            : challenge.difficulty === 'normal'
                            ? 'bg-blue-50 border-blue-200'
                            : challenge.difficulty === 'hard'
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-red-50 border-red-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="text-sm">
                          <div className="font-medium mb-1 ${
                            challenge.canChallenge
                              ? challenge.difficulty === 'easy'
                                ? 'text-green-800'
                                : challenge.difficulty === 'normal'
                                ? 'text-blue-800'
                                : challenge.difficulty === 'hard'
                                ? 'text-orange-800'
                                : 'text-red-800'
                              : 'text-red-800'
                          }">
                            {challenge.canChallenge 
                              ? `${getAIDisplayName(aiDifficulty)} - ${
                                  challenge.difficulty === 'easy' ? '练习级别 💚'
                                  : challenge.difficulty === 'normal' ? '平衡挑战 💙'
                                  : challenge.difficulty === 'hard' ? '高难挑战 🧡'
                                  : '极限挑战 ❤️'
                                }`
                              : '❌ 无法挑战'
                            }
                          </div>
                          <div className={challenge.canChallenge 
                            ? challenge.difficulty === 'easy' ? 'text-green-700'
                              : challenge.difficulty === 'normal' ? 'text-blue-700'
                              : challenge.difficulty === 'hard' ? 'text-orange-700'
                              : 'text-red-700'
                            : 'text-red-700'
                          }>
                            {challenge.reason || getAIDescriptionText(aiDifficulty)}
                          </div>
                        </div>
                      </div>
                      
                      {/* 智能推荐 */}
                      {recommendations && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                          <div className="text-sm">
                            <div className="font-medium text-purple-800 mb-2">
                              🎯 为 {players.find(p => p.id === selectedPlayer1)?.nickname} 推荐的AI训练
                            </div>
                            <div className="text-purple-700 mb-2">
                              当前水平: {recommendations.playerRank?.displayName} → 目标: {recommendations.trainingPlan.nextGoal}
                            </div>
                            <div className="text-purple-600 text-xs">
                              {recommendations.trainingPlan.advice}
                            </div>
                            
                            {/* 推荐的AI列表 */}
                            <div className="mt-2">
                              <div className="text-xs text-purple-600 mb-1">推荐训练对手:</div>
                              <div className="flex flex-wrap gap-1">
                                {recommendations.recommendations.recommended.slice(0, 3).map(ai => (
                                  <button
                                    key={ai}
                                    onClick={() => setAiDifficulty(ai)}
                                    className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded border text-purple-700"
                                  >
                                    {getAIDisplayName(ai)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                {/* 未选择玩家时的基本描述 */}
                {!selectedPlayer1 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-sm">
                      <div className="font-medium text-blue-800 mb-1">
                        当前选择: {getAIDisplayName(aiDifficulty)}
                      </div>
                      <div className="text-blue-700">
                        {getAIDescriptionText(aiDifficulty)}
                      </div>
                      <div className="text-blue-600 text-xs mt-2">
                        💡 选择玩家后可获得个性化AI推荐
                      </div>
                    </div>
                  </div>
                )}
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-900 rounded-full" />
                                <span className="font-medium">{player.nickname}</span>
                                <span className="text-sm text-gray-500">
                                  ({player.winCount}胜{player.loseCount}负)
                                </span>
                              </div>
                              {(() => {
                                const rank = getRankByNumericValue(player.rank);
                                if (rank) {
                                  const isHighRank = rank.numericValue >= 31;
                                  const isProfessional = rank.type === 'pro';
                                  return (
                                    <Badge 
                                      variant="secondary" 
                                      className={`flex items-center gap-1 text-xs ${
                                        isProfessional 
                                          ? 'bg-purple-100 text-purple-700'
                                          : isHighRank
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}
                                    >
                                      {isProfessional ? (
                                        <Trophy className="h-3 w-3" />
                                      ) : isHighRank ? (
                                        <Target className="h-3 w-3" />
                                      ) : (
                                        <span className="w-2 h-2 bg-current rounded-full" />
                                      )}
                                      {rank.displayName}
                                    </Badge>
                                  );
                                }
                                return null;
                              })()}
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />
                                <span className="font-medium">{player.nickname}</span>
                                <span className="text-sm text-gray-500">
                                  ({player.winCount}胜{player.loseCount}负)
                                </span>
                              </div>
                              {(() => {
                                const rank = getRankByNumericValue(player.rank);
                                if (rank) {
                                  const isHighRank = rank.numericValue >= 31;
                                  const isProfessional = rank.type === 'pro';
                                  return (
                                    <Badge 
                                      variant="secondary" 
                                      className={`flex items-center gap-1 text-xs ${
                                        isProfessional 
                                          ? 'bg-purple-100 text-purple-700'
                                          : isHighRank
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}
                                    >
                                      {isProfessional ? (
                                        <Trophy className="h-3 w-3" />
                                      ) : isHighRank ? (
                                        <Target className="h-3 w-3" />
                                      ) : (
                                        <span className="w-2 h-2 bg-current rounded-full" />
                                      )}
                                      {rank.displayName}
                                    </Badge>
                                  );
                                }
                                return null;
                              })()}
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
      
      {/* AI能力指南模态框 */}
      {showAIGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <AIGuide onClose={() => setShowAIGuide(false)} />
          </div>
        </div>
      )}
    </div>
  );
}