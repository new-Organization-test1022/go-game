'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CaptureStatsChartProps {
  totalCaptured: number;
  totalLost: number;
  captureGameStats: {
    wins: number;
    losses: number;
    winRate: number;
  };
  standardGameStats: {
    wins: number;
    losses: number;
    winRate: number;
  };
  title?: string;
}

export function CaptureStatsChart({
  totalCaptured,
  totalLost,
  captureGameStats,
  standardGameStats,
  title = '提子统计与规则分析'
}: CaptureStatsChartProps) {
  
  const captureData = [
    {
      category: '提子数据',
      captured: totalCaptured,
      lost: totalLost,
    }
  ];

  const ruleStatsData = [
    {
      rule: '吃子游戏',
      wins: captureGameStats.wins,
      losses: captureGameStats.losses,
      winRate: captureGameStats.winRate,
    },
    {
      rule: '标准规则',
      wins: standardGameStats.wins,
      losses: standardGameStats.losses,
      winRate: standardGameStats.winRate,
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      
      {/* 提子统计柱状图 */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">提子数据对比</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={captureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [
              `${value}子`,
              name === 'captured' ? '已提取' : '已失去'
            ]} />
            <Legend />
            <Bar dataKey="captured" fill="#10b981" name="已提取" />
            <Bar dataKey="lost" fill="#ef4444" name="已失去" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 规则统计对比 */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">不同规则胜负对比</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ruleStatsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="rule" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => {
              if (name === 'winRate') return [`${value.toFixed(1)}%`, '胜率'];
              return [`${value}局`, name === 'wins' ? '胜利' : '失败'];
            }} />
            <Legend />
            <Bar dataKey="wins" fill="#10b981" name="胜利" />
            <Bar dataKey="losses" fill="#ef4444" name="失败" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 规则胜率对比 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {captureGameStats.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">吃子游戏胜率</div>
            <div className="text-xs text-gray-600 mt-1">
              {captureGameStats.wins}胜 {captureGameStats.losses}败
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {standardGameStats.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-green-700">标准规则胜率</div>
            <div className="text-xs text-gray-600 mt-1">
              {standardGameStats.wins}胜 {standardGameStats.losses}败
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}