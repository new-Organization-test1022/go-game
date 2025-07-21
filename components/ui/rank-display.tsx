import React from 'react';
import { Star, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface RankInfo {
  type: string;
  level: number;
  displayName: string;
  numericValue: number;
}

interface RankDisplayProps {
  rankInfo: RankInfo;
  consecutiveWins: number;
  consecutiveLosses: number;
  className?: string;
}

export function RankDisplay({ rankInfo, consecutiveWins, consecutiveLosses, className }: RankDisplayProps) {
  const getRankColor = (type: string) => {
    switch (type) {
      case 'kyu': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'dan': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pro': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRankIcon = (type: string) => {
    switch (type) {
      case 'kyu': return <Star className="h-5 w-5" />;
      case 'dan': return <Award className="h-5 w-5" />;
      case 'pro': return <TrendingUp className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getProgressToNext = () => {
    const winsNeeded = Math.max(0, 5 - consecutiveWins);
    return {
      current: consecutiveWins,
      needed: winsNeeded,
      percentage: (consecutiveWins / 5) * 100
    };
  };

  const progress = getProgressToNext();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getRankIcon(rankInfo.type)}
          当前段位
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Rank Badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getRankColor(rankInfo.type)}`}>
            <span className="text-xl font-bold">{rankInfo.displayName}</span>
          </div>

          {/* Progress to Next Rank */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">升段进度</span>
              <span className="font-medium">
                {consecutiveWins}/5 连胜
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            
            {progress.needed > 0 ? (
              <p className="text-xs text-gray-600">
                还需 {progress.needed} 连胜即可升段
              </p>
            ) : (
              <p className="text-xs text-green-600 font-medium">
                🎉 已达到升段条件！
              </p>
            )}
          </div>

          {/* Consecutive Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {consecutiveWins}
              </div>
              <div className="text-xs text-gray-600">连胜</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {consecutiveLosses}
              </div>
              <div className="text-xs text-gray-600">连败</div>
            </div>
          </div>

          {/* Review Suggestion */}
          {consecutiveLosses >= 5 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">建议复盘</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                连败5局，建议复盘总结，提升棋力
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface RankHistoryProps {
  rankUpdates: Array<{
    oldRank: RankInfo;
    newRank: RankInfo;
    date: number;
    gameId: number;
  }>;
  className?: string;
}

export function RankHistory({ rankUpdates, className }: RankHistoryProps) {
  if (rankUpdates.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>段位变化历史</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankUpdates.slice(0, 5).map((update, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium">
                    {update.oldRank.displayName} → {update.newRank.displayName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(update.date).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
              <div className="text-sm text-green-600 font-semibold">
                升段
              </div>
            </div>
          ))}
          
          {rankUpdates.length > 5 && (
            <div className="text-center text-sm text-gray-600">
              共 {rankUpdates.length} 次段位变化
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}