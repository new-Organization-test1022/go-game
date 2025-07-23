'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface WinRateChartProps {
  wins: number;
  losses: number;
  title?: string;
}

const COLORS = ['#10b981', '#ef4444', '#6b7280'];

export function WinRateChart({ wins, losses, title = '胜负分布' }: WinRateChartProps) {
  const totalGames = wins + losses;
  
  if (totalGames === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        暂无对局数据
      </div>
    );
  }

  const data = [
    { name: '胜利', value: wins, color: '#10b981' },
    { name: '失败', value: losses, color: '#ef4444' },
  ];

  const winRate = ((wins / totalGames) * 100).toFixed(1);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value}局`, name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{winRate}%</div>
            <div className="text-sm text-gray-600">胜率</div>
          </div>
        </div>
      </div>
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>{wins}胜</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>{losses}败</span>
        </div>
      </div>
    </div>
  );
}