'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DetailedGameStats } from '@/lib/stats/game-stats';

interface TimeAnalysisChartProps {
  games: DetailedGameStats[];
  averageDuration: number;
  title?: string;
}

export function TimeAnalysisChart({ 
  games, 
  averageDuration,
  title = '对局时长分析' 
}: TimeAnalysisChartProps) {
  
  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        暂无对局数据
      </div>
    );
  }

  // 处理数据：按时长分组统计
  const timeRanges = [
    { range: '0-5分钟', min: 0, max: 300, count: 0 },
    { range: '5-10分钟', min: 300, max: 600, count: 0 },
    { range: '10-20分钟', min: 600, max: 1200, count: 0 },
    { range: '20-30分钟', min: 1200, max: 1800, count: 0 },
    { range: '30-60分钟', min: 1800, max: 3600, count: 0 },
    { range: '60分钟以上', min: 3600, max: Infinity, count: 0 },
  ];

  games.forEach(game => {
    const duration = game.duration;
    for (const range of timeRanges) {
      if (duration >= range.min && duration < range.max) {
        range.count++;
        break;
      }
    }
  });

  // 准备时间趋势数据 (最近10局)
  const recentGames = games
    .slice(0, 10)
    .reverse()
    .map((game, index) => ({
      game: `第${index + 1}局`,
      duration: Math.round(game.duration / 60), // 转换为分钟
      moves: game.totalMoves,
      date: new Date(game.dateTime).toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      }),
    }));

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      
      {/* 时长统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatDuration(averageDuration)}
            </div>
            <div className="text-sm text-blue-700">平均时长</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatDuration(Math.max(...games.map(g => g.duration)))}
            </div>
            <div className="text-sm text-green-700">最长对局</div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatDuration(Math.min(...games.map(g => g.duration)))}
            </div>
            <div className="text-sm text-purple-700">最短对局</div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(games.reduce((sum, g) => sum + g.totalMoves, 0) / games.length)}
            </div>
            <div className="text-sm text-orange-700">平均手数</div>
          </div>
        </div>
      </div>

      {/* 时长分布柱状图 */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">对局时长分布</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {timeRanges.map((range) => (
            <div key={range.range} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {range.count}
                </div>
                <div className="text-sm text-gray-600">{range.range}</div>
                <div className="text-xs text-gray-500">
                  {games.length > 0 ? ((range.count / games.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最近对局时长趋势 */}
      {recentGames.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">最近对局时长趋势</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={recentGames}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="game" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: '时长 (分钟)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'duration' ? `${value}分钟` : `${value}手`,
                  name === 'duration' ? '对局时长' : '总手数'
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="duration" 
                stroke="#2563eb" 
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}