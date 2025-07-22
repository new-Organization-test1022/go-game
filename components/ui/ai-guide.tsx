'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIDifficulty } from '@/lib/go/types';
import { AI_DESCRIPTIONS, getAIByCategory, AIDescription } from '@/lib/go/ai-descriptions';
import { Info, Brain, Target, Star, Trophy, Crown } from 'lucide-react';

interface AIGuideProps {
  onClose?: () => void;
}

export function AIGuide({ onClose }: AIGuideProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAI, setSelectedAI] = useState<AIDifficulty | null>(null);

  const categories = [
    { id: 'all', name: '全部', icon: Info, color: 'bg-gray-100' },
    { id: '初学者', name: '初学者 (30K-20K)', icon: Target, color: 'bg-green-100' },
    { id: '进阶', name: '进阶 (15K-5K)', icon: Brain, color: 'bg-yellow-100' },
    { id: '中级', name: '中级 (1K-3D)', icon: Star, color: 'bg-orange-100' },
    { id: '高级', name: '高级 (4D-7D)', icon: Trophy, color: 'bg-red-100' },
    { id: '专业', name: '专业 (1P-9P)', icon: Crown, color: 'bg-purple-100' }
  ];

  const getFilteredAIs = (): AIDescription[] => {
    if (selectedCategory === 'all') {
      return Object.values(AI_DESCRIPTIONS);
    }
    return getAIByCategory(selectedCategory as any);
  };

  const getCategoryIcon = (category: string) => {
    const categoryInfo = categories.find(cat => cat.id === category);
    const IconComponent = categoryInfo?.icon || Info;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '初学者': return 'text-green-600 bg-green-50';
      case '进阶': return 'text-yellow-600 bg-yellow-50';
      case '中级': return 'text-orange-600 bg-orange-50';
      case '高级': return 'text-red-600 bg-red-50';
      case '专业': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI对战能力指南
            </CardTitle>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                关闭
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600">
            选择合适的AI对手，挑战不同段位的围棋AI，提升您的棋艺水平
          </p>
        </CardHeader>
        <CardContent>
          {/* 类别选择器 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* AI列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {getFilteredAIs().map((ai) => (
              <Card 
                key={ai.difficulty}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAI === ai.difficulty ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedAI(ai.difficulty)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{ai.name}</h3>
                      <p className="text-xs text-gray-500">{ai.level}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getCategoryColor(ai.category)}
                    >
                      {getCategoryIcon(ai.category)}
                      <span className="ml-1">{ai.category}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{ai.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>思考时间: {ai.thinkingTime}ms</span>
                    <span>失误率: {(ai.errorRate * 100).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 详细信息 */}
          {selectedAI && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  {getCategoryIcon(AI_DESCRIPTIONS[selectedAI].category)}
                  {AI_DESCRIPTIONS[selectedAI].name} - 详细信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">基本信息</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">段位级别:</span>
                        <span className="font-medium">{AI_DESCRIPTIONS[selectedAI].level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">类别:</span>
                        <Badge className={getCategoryColor(AI_DESCRIPTIONS[selectedAI].category)}>
                          {AI_DESCRIPTIONS[selectedAI].category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">思考时间:</span>
                        <span className="font-medium">{AI_DESCRIPTIONS[selectedAI].thinkingTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">失误率:</span>
                        <span className="font-medium">{(AI_DESCRIPTIONS[selectedAI].errorRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">能力特征</h4>
                    <div className="space-y-1">
                      {AI_DESCRIPTIONS[selectedAI].capabilities.map((capability, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">行为特点</h4>
                    <div className="space-y-1">
                      {AI_DESCRIPTIONS[selectedAI].characteristics.map((characteristic, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>{characteristic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">适合人群</h4>
                    <div className="space-y-1">
                      {AI_DESCRIPTIONS[selectedAI].suitableFor.map((suitable, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>{suitable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border">
                  <h4 className="font-medium text-blue-800 mb-2">详细描述</h4>
                  <p className="text-sm text-gray-700">
                    {AI_DESCRIPTIONS[selectedAI].detailedDescription}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AIGuide;