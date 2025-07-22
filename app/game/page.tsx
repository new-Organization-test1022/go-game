'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoBoard } from '@/components/ui/board';
import { GameInfo } from '@/components/ui/game-info';
import { Button } from '@/components/ui/button';
import { GoGame, StoneColor, GameStatus, RuleType, TerritoryCounter } from '@/lib/go';
import { Player } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAIPlayer, getAIMove, AIPlayer, AIMove } from '@/lib/go/ai-engine';
import { AIDifficulty, GameType } from '@/lib/go/types';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Game parameters from URL
  const boardSize = parseInt(searchParams.get('size') || '19');
  const ruleType = (searchParams.get('rule') as RuleType) || RuleType.STANDARD;
  const player1Id = searchParams.get('player1') ? parseInt(searchParams.get('player1')!) : undefined;
  const player2Id = searchParams.get('player2') ? parseInt(searchParams.get('player2')!) : undefined;
  const gameType = (searchParams.get('gameType') as GameType) || GameType.HUMAN_VS_HUMAN;
  const aiDifficulty = (searchParams.get('aiDifficulty') as AIDifficulty) || AIDifficulty.AI_1K;

  // Game state
  const [game, setGame] = useState<GoGame | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [players, setPlayers] = useState<{ player1?: Player; player2?: Player }>({});
  const [scoreInfo, setScoreInfo] = useState<any>(null);
  const [gameTime, setGameTime] = useState(0);
  const [showTerritory, setShowTerritory] = useState(false);
  const [territoryOwners, setTerritoryOwners] = useState<Map<string, StoneColor>>(new Map());
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [isGameSaved, setIsGameSaved] = useState(false);
  const [aiPlayer, setAiPlayer] = useState<AIPlayer | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Initialize game and create database record
  useEffect(() => {
    const initializeGame = async () => {
      const newGame = new GoGame(boardSize, ruleType, player1Id, player2Id);
      newGame.startGame();
      setGame(newGame);
      setGameState(newGame.getGameState());
      
      // Initialize AI player if this is AI vs Human game
      if (gameType === GameType.HUMAN_VS_AI) {
        const ai = createAIPlayer(aiDifficulty);
        setAiPlayer(ai);
      }

      // Create game record in database
      if (player1Id && player2Id) {
        try {
          const response = await fetch('/api/games', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              player1Id,
              player2Id,
              boardSize,
              ruleType,
            }),
          });
          
          if (response.ok) {
            const gameRecord = await response.json();
            setCurrentGameId(gameRecord.id);
          }
        } catch (error) {
          console.error('Failed to create game record:', error);
        }
      }
    };

    initializeGame();
  }, [boardSize, ruleType, player1Id, player2Id, gameType, aiDifficulty]);

  // Load player data
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        const allPlayers: Player[] = await response.json();
        
        const player1 = player1Id ? allPlayers.find(p => p.id === player1Id) : undefined;
        const player2 = player2Id ? allPlayers.find(p => p.id === player2Id) : undefined;
        
        setPlayers({ player1, player2 });
      } catch (error) {
        console.error('Failed to load players:', error);
      }
    };

    if (player1Id || player2Id) {
      loadPlayers();
    }
  }, [player1Id, player2Id]);

  // Game timer
  useEffect(() => {
    if (!gameState || gameState.status !== GameStatus.PLAYING) return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.status]);

  // Calculate territory info
  const updateTerritoryInfo = useCallback(() => {
    if (!game) return;

    // Use the game's built-in scoring method instead of accessing private properties
    const gameScores = game.calculateScore();
    const info = {
      blackTerritory: gameScores.blackTerritory,
      whiteTerritory: gameScores.whiteTerritory,
      blackCaptured: gameState?.boardState?.capturedWhite || 0,
      whiteCaptured: gameState?.boardState?.capturedBlack || 0,
      blackTotal: gameScores.blackTotal,
      whiteTotal: gameScores.whiteTotal,
      territories: [], // Simplified for now
    };
    
    setScoreInfo(info);

    // For now, we'll skip the detailed territory display
    // In a production version, you'd expose territory methods from GoGame
    setTerritoryOwners(new Map());
  }, [game, gameState]);

  // Check if a move is legal
  const checkLegalMove = useCallback((position: { x: number; y: number }) => {
    if (!game || gameState?.status !== GameStatus.PLAYING) return false;
    return game.isLegalMove(position);
  }, [game, gameState?.status]);

  // Handle stone placement
  const handleStonePlace = useCallback((position: { x: number; y: number }) => {
    if (!game || gameState?.status !== GameStatus.PLAYING) return;
    
    // In AI mode, only allow user to play when it's their turn
    if (gameType === GameType.HUMAN_VS_AI && gameState.currentPlayer === StoneColor.WHITE) {
      return; // AI plays white, so user can't play white stones
    }

    const success = game.makeMove(position);
    if (success) {
      setGameState(game.getGameState());
      updateTerritoryInfo();
    }
  }, [game, gameState?.status, gameType, updateTerritoryInfo]);

  // Handle pass
  const handlePass = useCallback(() => {
    if (!game) return;
    
    game.pass();
    setGameState(game.getGameState());
    updateTerritoryInfo();
  }, [game, updateTerritoryInfo]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (!game) return;
    
    const success = game.undoLastMove();
    if (success) {
      setGameState(game.getGameState());
      updateTerritoryInfo();
    }
  }, [game, updateTerritoryInfo]);

  // Handle resign
  const handleResign = useCallback(() => {
    if (!game) return;
    
    game.endGame();
    setGameState(game.getGameState());
    updateTerritoryInfo();
  }, [game, updateTerritoryInfo]);

  // Refresh score
  const handleRefreshScore = useCallback(() => {
    updateTerritoryInfo();
  }, [updateTerritoryInfo]);

  // Save game result when game ends
  const saveGameResult = useCallback(async () => {
    if (!game || !currentGameId || !scoreInfo || isGameSaved) return;

    try {
      const duration = Math.floor(gameTime);
      const winnerId = scoreInfo.blackTotal > scoreInfo.whiteTotal 
        ? player1Id 
        : scoreInfo.whiteTotal > scoreInfo.blackTotal 
        ? player2Id 
        : null;

      const gameRecord = game.exportGameRecord();

      await fetch('/api/games', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: currentGameId,
          winnerId,
          blackScore: scoreInfo.blackTotal,
          whiteScore: scoreInfo.whiteTotal,
          gameRecord,
          duration,
          player1Id,
          player2Id,
        }),
      });

      setIsGameSaved(true);
    } catch (error) {
      console.error('Failed to save game result:', error);
    }
  }, [game, currentGameId, scoreInfo, gameTime, player1Id, player2Id, isGameSaved]);

  // Auto-save when game finishes
  useEffect(() => {
    if (gameState?.status === GameStatus.FINISHED && !isGameSaved) {
      saveGameResult();
    }
  }, [gameState?.status, saveGameResult, isGameSaved]);

  // AI move handling
  const makeAIMove = useCallback(async () => {
    if (!game || !aiPlayer || !gameState || gameState.status !== GameStatus.PLAYING) return;
    if (gameState.currentPlayer !== StoneColor.WHITE) return; // AI plays white
    if (isAiThinking) return;

    setIsAiThinking(true);
    
    try {
      const aiMove: AIMove = await getAIMove(
        gameState.boardState, 
        aiPlayer, 
        StoneColor.WHITE,
        [] // TODO: Add move history if needed
      );
      
      if (aiMove.position) {
        const success = game.makeMove(aiMove.position);
        if (success) {
          setGameState(game.getGameState());
          updateTerritoryInfo();
        }
      } else {
        // AI passes
        game.pass();
        setGameState(game.getGameState());
        updateTerritoryInfo();
      }
    } catch (error) {
      console.error('AI move failed:', error);
    } finally {
      setIsAiThinking(false);
    }
  }, [game, aiPlayer, gameState, isAiThinking, updateTerritoryInfo]);
  
  // Auto-trigger AI moves
  useEffect(() => {
    if (gameType === GameType.HUMAN_VS_AI && gameState?.currentPlayer === StoneColor.WHITE && gameState?.status === GameStatus.PLAYING) {
      // Small delay to make the AI move feel more natural
      const timer = setTimeout(() => {
        makeAIMove();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameType, gameState?.currentPlayer, gameState?.status, makeAIMove]);

  // Initial territory calculation
  useEffect(() => {
    if (game) {
      updateTerritoryInfo();
    }
  }, [game, updateTerritoryInfo]);

  if (!game || !gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">初始化游戏中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">围棋对战</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowTerritory(!showTerritory)}
                className="text-sm"
              >
                {showTerritory ? '隐藏地盘' : '显示地盘'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/setup')}
                className="text-sm"
              >
                返回设置
              </Button>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {boardSize}路棋盘 · {ruleType === RuleType.STANDARD ? '标准规则' : '吃子游戏'}
          </div>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex justify-center">
                <GoBoard
                  size={boardSize}
                  boardState={gameState.boardState}
                  currentPlayer={gameState.currentPlayer}
                  onStonePlace={handleStonePlace}
                  onCheckLegalMove={checkLegalMove}
                  isGameActive={gameState.status === GameStatus.PLAYING}
                  showTerritory={showTerritory}
                  territoryOwners={territoryOwners}
                />
              </div>
            </Card>
          </div>

          {/* Game Info Sidebar */}
          <div className="lg:col-span-1">
            <GameInfo
              currentPlayer={gameState.currentPlayer}
              gameStatus={gameState.status}
              player1={players.player1}
              player2={gameType === GameType.HUMAN_VS_AI ? {
                id: -1,
                nickname: aiPlayer?.name || 'AI',
                winCount: 0,
                loseCount: 0,
                totalTime: 0,
                rank: 1,
                consecutiveWins: 0,
                consecutiveLosses: 0,
                totalGames: 0,
                lastRankUpdate: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now()
              } : players.player2}
              scoreInfo={scoreInfo}
              gameTime={gameTime}
              onPass={handlePass}
              onUndo={handleUndo}
              onResign={handleResign}
              onRefreshScore={handleRefreshScore}
              canUndo={gameState.moves.length > 0}
              isAiGame={gameType === GameType.HUMAN_VS_AI}
              isAiThinking={isAiThinking}
            />
          </div>
        </div>

        {/* Game History (if finished) */}
        {gameState.status === GameStatus.FINISHED && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>对局记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>开始时间:</strong> {new Date(gameState.startTime).toLocaleString()}
                </div>
                <div>
                  <strong>结束时间:</strong> {gameState.endTime ? new Date(gameState.endTime).toLocaleString() : '-'}
                </div>
                <div>
                  <strong>总用时:</strong> {Math.floor((gameState.endTime - gameState.startTime) / 1000 / 60)} 分钟
                </div>
                <div>
                  <strong>总手数:</strong> {gameState.moves.filter((m: any) => m.position.x !== -1).length}
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/setup')}
                  className="text-sm"
                >
                  新游戏
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/players')}
                  className="text-sm"
                >
                  查看统计
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}