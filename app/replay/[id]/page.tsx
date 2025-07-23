'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameReplay } from '@/components/ui/game-replay';
import { Game, Player, GameMove } from '@/lib/db/schema';

interface ReplayPageProps {
  params: { id: string };
}

export default function ReplayPage({ params }: ReplayPageProps) {
  const router = useRouter();
  const gameId = parseInt(params.id);
  
  const [game, setGame] = useState<Game | null>(null);
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [moves, setMoves] = useState<GameMove[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(gameId)) {
      setError('无效的游戏ID');
      setIsLoading(false);
      return;
    }

    loadGameData();
  }, [gameId]);

  const loadGameData = async () => {
    try {
      setIsLoading(true);
      
      // Load game data
      const gameResponse = await fetch(`/api/games/${gameId}`);
      if (!gameResponse.ok) {
        throw new Error('Failed to load game data');
      }
      const gameData = await gameResponse.json();
      setGame(gameData.games);
      
      // Load players
      const playersResponse = await fetch('/api/players');
      if (playersResponse.ok) {
        const allPlayers: Player[] = await playersResponse.json();
        const p1 = allPlayers.find(p => p.id === gameData.games.player1Id);
        const p2 = allPlayers.find(p => p.id === gameData.games.player2Id);
        setPlayer1(p1 || null);
        setPlayer2(p2 || null);
      }

      // Load moves
      const movesResponse = await fetch(`/api/moves?gameId=${gameId}`);
      if (movesResponse.ok) {
        const movesData = await movesResponse.json();
        setMoves(movesData);
      }

    } catch (error) {
      console.error('Failed to load game data:', error);
      setError('加载游戏数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/history');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载棋谱中...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">
            {error || '游戏数据不存在'}
          </div>
          <button
            onClick={() => router.push('/history')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            返回历史记录
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameReplay
      gameId={gameId}
      game={game}
      player1={player1}
      player2={player2}
      moves={moves}
      onClose={handleClose}
    />
  );
}