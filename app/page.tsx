'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, Settings, Trophy, Clock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: Settings,
      title: '多种棋盘规格',
      description: '支持13路和19路棋盘，满足不同水平玩家需求',
    },
    {
      icon: Users,
      title: '玩家管理',
      description: '创建和管理玩家档案，追踪胜负记录和统计信息',
    },
    {
      icon: Trophy,
      title: '实时计分',
      description: '智能地盘计算，实时显示黑白双方目数估算',
    },
    {
      icon: Clock,
      title: '完整规则',
      description: '严格实现围棋规则，包含提子、禁着、劫争等逻辑',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
              围棋对战平台
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              专业的围棋对弈平台，支持完整围棋规则、实时目数计算、玩家管理与统计功能
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/setup')}
                className="text-lg px-8 py-3 bg-amber-600 hover:bg-amber-700"
              >
                开始对局
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/players')}
                className="text-lg px-8 py-3 border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                玩家管理
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">核心功能</h2>
            <p className="mt-4 text-lg text-gray-600">
              完整实现围棋对弈所需的各项功能
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-amber-100 text-amber-600">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Game Rules Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                支持的游戏规则
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-600">标准围棋规则</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 完整的围棋规则实现</li>
                      <li>• 地盘目数计算</li>
                      <li>• 提子逻辑和气的计算</li>
                      <li>• 禁着点和劫争处理</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-600">吃子游戏</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 以提取对方棋子为目标</li>
                      <li>• 适合初学者练习</li>
                      <li>• 简化的胜负判定</li>
                      <li>• 快速对局模式</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                棋盘规格
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-600">19路标准棋盘</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      19×19，共361个交点，国际标准围棋棋盘规格，适合正式对局和高水平玩家。
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-600">13路小棋盘</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      13×13，共169个交点，适合快速对局、教学练习和初学者入门。
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">数据统计</h2>
            <p className="mt-4 text-lg text-gray-600">
              完整的玩家数据追踪和统计分析
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-600">胜负记录</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">追踪每位玩家的胜负场次和胜率统计</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-600">对局时长</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">记录累计对局时间和平均用时数据</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-600">对局历史</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">保存完整的对局记录和棋谱信息</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            准备开始围棋对局了吗？
          </h2>
          <p className="text-xl mb-8 text-amber-100">
            立即创建玩家账户，选择棋盘规格和游戏规则，开始您的围棋之旅
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push('/players')}
              className="text-lg px-8 py-3 bg-white text-amber-600 hover:bg-gray-100"
            >
              管理玩家
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/setup')}
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-amber-600"
            >
              开始游戏
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}