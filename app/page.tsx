'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, Settings, Trophy, Sword, Brain, Target } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: Brain,
      title: '智慧博弈',
      description: '22级AI对手，从初学到大师',
      subtitle: '人机共舞，棋艺精进'
    },
    {
      icon: Users,
      title: '段位体系',
      description: '完整中国围棋段位系统',
      subtitle: '从30K到专业九段'
    },
    {
      icon: Target,
      title: '精准计算',
      description: '实时目数计算与地盘分析',
      subtitle: '黑白分明，毫厘不差'
    },
    {
      icon: Sword,
      title: '规则严谨',
      description: '完整围棋规则，提子劫争',
      subtitle: '千年传承，一脉相承'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden paper-texture">
      {/* 古风背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 ink-wash-bg">
        {/* 墨水画背景纹理 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-black ink-blur"></div>
          <div className="absolute top-20 right-20 w-24 h-48 bg-black ink-blur transform rotate-45"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-20 bg-black ink-blur transform -rotate-12"></div>
          <div className="absolute bottom-32 right-1/3 w-28 h-28 rounded-full bg-black ink-blur"></div>
          
          {/* 山峦轮廓 */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-slate-800 opacity-5 mountain-silhouette"></div>
        </div>
        
        {/* 竹影装饰 */}
        <div className="absolute left-0 top-0 h-full w-8 bamboo-shadow"></div>
        <div className="absolute right-0 top-0 h-full w-4 bamboo-shadow transform rotate-180"></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 顶部导航 */}
        <nav className="px-4 md:px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 md:w-8 md:h-8 weiqi-stone-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 md:w-4 md:h-4 weiqi-stone-white rounded-full"></div>
              </div>
              <span className="text-lg md:text-xl chinese-title text-slate-800 tracking-wide">围棋雅韵</span>
            </div>
            <div className="hidden md:flex space-x-8 text-slate-600">
              <button 
                onClick={() => router.push('/players')} 
                className="calligraphy-text hover:text-slate-800 transition-all duration-300 hover:scale-105 relative group"
              >
                棋手管理
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></div>
              </button>
              <button 
                onClick={() => router.push('/setup')} 
                className="calligraphy-text hover:text-slate-800 transition-all duration-300 hover:scale-105 relative group"
              >
                对局设置
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></div>
              </button>
              <button 
                onClick={() => router.push('/stats')} 
                className="calligraphy-text hover:text-slate-800 transition-all duration-300 hover:scale-105 relative group"
              >
                统计分析
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></div>
              </button>
              <button 
                onClick={() => router.push('/history')} 
                className="calligraphy-text hover:text-slate-800 transition-all duration-300 hover:scale-105 relative group"
              >
                历史对局
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </nav>

        {/* 英雄区域 */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            {/* 主标题 */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-6xl md:text-8xl chinese-title text-slate-900 tracking-wider mb-4 relative">
                围棋对弈
                <div className="absolute -top-4 -right-4 w-3 h-3 seal-red rounded-full"></div>
              </h1>
              <div className="text-lg sm:text-2xl md:text-3xl calligraphy-text text-slate-600 font-light tracking-widest">
                千年智慧 · 一盘棋局
              </div>
            </div>

            {/* 副标题 */}
            <div className="max-w-3xl mx-auto mb-12">
              <p className="text-base md:text-lg lg:text-xl calligraphy-text text-slate-500 leading-relaxed font-light">
                承古人之智慧，融现代之科技
                <br />
                <span className="text-slate-400 seal-red">纹枰论道，黑白分明</span>
              </p>
            </div>

            {/* 棋盘装饰 */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                {/* 主棋盘 */}
                <div className="ancient-scroll p-6 rounded-lg shadow-xl">
                  <div className="relative p-4 bg-gradient-to-br from-amber-50 to-yellow-50">
                    {/* 创建5x5的围棋棋盘 */}
                    <svg width="140" height="140" className="mx-auto">
                      {/* 棋盘背景 */}
                      <rect
                        x="5"
                        y="5"
                        width="130"
                        height="130"
                        fill="#F3E5AB"
                        stroke="#8B7355"
                        strokeWidth="2"
                        rx="4"
                      />
                      
                      {/* 绘制棋盘网格线 */}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <g key={`lines-${i}`}>
                          {/* 水平线 */}
                          <line
                            x1={20}
                            y1={20 + i * 25}
                            x2={120}
                            y2={20 + i * 25}
                            stroke="#654321"
                            strokeWidth="1.5"
                          />
                          {/* 垂直线 */}
                          <line
                            x1={20 + i * 25}
                            y1={20}
                            x2={20 + i * 25}
                            y2={120}
                            stroke="#654321"
                            strokeWidth="1.5"
                          />
                        </g>
                      ))}
                      
                      {/* 天元（中心点）标记 */}
                      <circle
                        cx={70}
                        cy={70}
                        r="2.5"
                        fill="#654321"
                      />
                      
                      {/* 棋子 - 黑子在(1,1)位置 */}
                      <circle
                        cx={45}
                        cy={45}
                        r="10"
                        fill="url(#blackStoneGradient)"
                        stroke="#111827"
                        strokeWidth="1"
                        className="drop-shadow-lg"
                      />
                      
                      {/* 棋子 - 白子在(3,3)位置 */}
                      <circle
                        cx={95}
                        cy={95}
                        r="10"
                        fill="url(#whiteStoneGradient)"
                        stroke="#9ca3af"
                        strokeWidth="1"
                        className="drop-shadow-lg"
                      />
                      
                      {/* 渐变定义 */}
                      <defs>
                        <radialGradient id="blackStoneGradient" cx="0.3" cy="0.3">
                          <stop offset="0%" stopColor="#4b5563" />
                          <stop offset="100%" stopColor="#1f2937" />
                        </radialGradient>
                        <radialGradient id="whiteStoneGradient" cx="0.3" cy="0.3">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="100%" stopColor="#e5e7eb" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* 传统装饰元素 */}
                  <div className="flex justify-between items-center mt-4 text-xs calligraphy-text text-slate-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 weiqi-stone-black rounded-full"></div>
                      <span>黑先</span>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-600 font-bold">纹枰论道</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>白后</span>
                      <div className="w-3 h-3 weiqi-stone-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* 棋盘标记 */}
                <div className="absolute -top-3 -right-3 bg-slate-800 text-white px-2 py-1 rounded-full text-xs font-mono">
                  19路
                </div>
                
                {/* 中国结装饰 */}
                <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-red-600 transform rotate-45 opacity-20"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 border-2 border-red-600 transform rotate-45 opacity-20"></div>
              </div>
            </div>

            {/* 行动按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <Button
                size="lg"
                onClick={() => router.push('/setup')}
                className="chinese-title text-base md:text-lg px-8 md:px-12 py-4 md:py-5 bg-slate-800 hover:bg-slate-900 text-white rounded-none border-2 border-slate-800 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden hover:scale-105 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center">
                  开始对弈
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-slate-900 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                {/* 古风装饰 */}
                <div className="absolute top-1 right-1 w-2 h-2 border border-amber-400 opacity-30 transform rotate-45"></div>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/players')}
                className="chinese-title text-base md:text-lg px-8 md:px-12 py-4 md:py-5 border-2 border-slate-800 text-slate-800 hover:bg-slate-50 rounded-none hover:shadow-xl transition-all duration-500 hover:scale-105 relative group w-full sm:w-auto"
              >
                棋手档案
                <div className="absolute inset-0 border-2 border-amber-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform rotate-1"></div>
              </Button>
            </div>
          </div>
        </section>

        {/* 特色功能 */}
        <section className="py-12 md:py-20 relative">
          {/* 传统花纹背景 */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-16 h-16 border-2 border-slate-200 rounded-full opacity-10"></div>
            <div className="absolute top-32 right-20 w-12 h-12 border border-slate-200 transform rotate-45 opacity-10"></div>
            <div className="absolute bottom-20 left-1/4 w-20 h-20 border-2 border-slate-200 rounded-full opacity-10"></div>
            <div className="absolute bottom-40 right-1/3 w-8 h-16 border border-slate-200 opacity-10"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            {/* 节标题 */}
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl chinese-title text-slate-800 mb-4 tracking-wide">棋艺精髓</h2>
              {/* 传统分割线 */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-8 h-0.5 bg-slate-800"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full mx-4"></div>
                <div className="w-8 h-0.5 bg-slate-800"></div>
              </div>
              <p className="text-base md:text-lg calligraphy-text text-slate-500 font-light">
                融合传统与现代，打造完美对弈体验
              </p>
            </div>

            {/* 功能卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-700 border-0 ancient-scroll hover:bg-white/95 rounded-none hover:scale-105 hover:-translate-y-2 cursor-pointer">
                  <CardContent className="p-6 md:p-8 text-center relative">
                    {/* 传统装饰角 */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                    
                    {/* 图标 */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded-full group-hover:bg-slate-800 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg">
                        <feature.icon className="h-8 w-8 text-slate-600 group-hover:text-amber-400 transition-colors duration-500" />
                      </div>
                    </div>
                    
                    {/* 标题 */}
                    <h3 className="text-xl chinese-title text-slate-800 mb-3 tracking-wide group-hover:text-slate-900 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    {/* 描述 */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 group-hover:text-slate-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                    
                    {/* 副标题 */}
                    <div className="text-xs calligraphy-text text-slate-400 font-light tracking-wider border-t border-slate-100 pt-4 group-hover:text-amber-600 transition-colors duration-300">
                      {feature.subtitle}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 段位展示 */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            
            {/* 中国传统云纹 */}
            <div className="absolute top-4 left-4 w-32 h-8 border border-white opacity-5 rounded-full"></div>
            <div className="absolute top-8 left-12 w-24 h-6 border border-white opacity-5 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-28 h-8 border border-white opacity-5 rounded-full"></div>
            <div className="absolute bottom-8 right-12 w-20 h-6 border border-white opacity-5 rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center relative z-10">
            <h2 className="text-2xl md:text-4xl chinese-title mb-6 md:mb-8 tracking-wide">段位传承</h2>
            <p className="text-lg md:text-xl calligraphy-text text-slate-300 mb-8 md:mb-12 font-light">
              从业余30级到专业九段，每一步都是棋艺的升华
            </p>
            
            {/* 段位等级展示 */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
              {['30K', '25K', '20K', '15K', '10K', '5K', '1K', '1D', '3D', '6D', '9D', '1P', '5P', '9P'].map((rank, index) => (
                <div key={rank} className={`px-3 md:px-4 py-1 md:py-2 rounded-full border text-xs md:text-sm font-mono tracking-wider transition-all duration-300 hover:scale-110 ${
                  rank.includes('K') ? 'border-green-400 text-green-400 hover:bg-green-400 hover:text-slate-800' :
                  rank.includes('D') ? 'border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-800' :
                  'border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-slate-800'
                }`}>
                  {rank}
                </div>
              ))}
            </div>
            
            <div className="text-slate-400 text-sm font-light">
              智能匹配 · 公平对弈 · 段位晋升
            </div>
          </div>
        </section>

        {/* 底部 */}
        <footer className="py-8 md:py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 weiqi-stone-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 weiqi-stone-white rounded-full"></div>
              </div>
              <span className="text-lg chinese-title text-slate-800">围棋雅韵</span>
            </div>
            <p className="text-slate-500 text-sm calligraphy-text font-light">
              传承千年棋道 · 创新现代对弈
            </p>
            <div className="mt-6 text-xs text-slate-400">
              © 2024 围棋对战平台 · Made by ClackyAI
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}