import { NextRequest, NextResponse } from 'next/server';
import { GameStatsService } from '@/lib/stats/game-stats';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const recentGames = await GameStatsService.getRecentGames(limit);
    const globalStats = await GameStatsService.getGlobalStats();
    
    return NextResponse.json({
      recentGames,
      globalStats,
    });
  } catch (error) {
    console.error('Failed to get game stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}