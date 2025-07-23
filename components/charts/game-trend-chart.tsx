'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DetailedGameStats } from '@/lib/stats/game-stats';

interface GameTrendChartProps {
  games: DetailedGameStats[];
  playerId: number;
  title?: string;
}

export function GameTrendChart({ games, playerId, title = '对局趋势' }: GameTrendChartProps) {
  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        暂无对局数据
      </div>
    );
  }

  // 处理数据，计算累积胜率
  const processedData = games
    .slice(0, 20) // 只显示最近20局
    .reverse() // 按时间正序排列
    .map((game, index) => {
      const isWinner = game.winner?.id === playerId;
      const gameNumber = index + 1;
      
      // 计算到当前为止的胜率
      const gamesUpToNow = games.slice(-gameNumber);
      const winsUpToNow = gamesUpToNow.filter(g => g.winner?.id === playerId).length;
      const winRate = (winsUpToNow / gameNumber) * 100;

      return {
        game: `第${gameNumber}局`,
        winRate: parseFloat(winRate.toFixed(1)),
        result: isWinner ? 1 : 0,
        duration: Math.round(game.duration / 60), // 转换为分钟
        date: new Date(game.dateTime).toLocaleDateString('zh-CN', { 
          month: 'short', 
          day: 'numeric' 
        }),
      };
    });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="game" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: '胜率 (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'winRate') return [`${value}%`, '累积胜率'];
              if (name === 'duration') return [`${value}分钟`, '对局时长'];
              return [value, name];
            }}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="winRate" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            name="累积胜率"
          />
          <Line 
            type="monotone" 
            dataKey="duration" 
            stroke="#16a34a" 
            strokeWidth={2}
            dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
            name="对局时长"
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}