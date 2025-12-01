import { useEffect } from 'react';
import { Chess } from 'chess.js';
import { gameStateService } from '../services/gameStateService';
import { useGamePropSelector, DEFAULT_GAME } from '..';
import type { Square } from '../types';

/**
 * Hook to manage Firebase game subscription and chess game state synchronization
 * @param gameId - The game ID to subscribe to
 * @param chessGame - Chess.js instance to sync with Firebase data
 * @param onGameUpdate - Callback when game data changes with FEN and last move
 */
export function useGameSubscription(
  gameId: string | undefined,
  chessGame: Chess,
  onGameUpdate: (fen: string, from?: Square, to?: Square) => void
) {
  // Create Firebase subscription
  useEffect(() => {
    if (!gameId) return;

    gameStateService.createFirebaseSubscription(gameId);

    return () => {
      gameStateService.unsubscribeFromGame();
    };
  }, [gameId]);

  // Subscribe to game changes via RxJS
  const gameData = useGamePropSelector((game) => game, DEFAULT_GAME);

  // Sync chess game state when game data changes
  useEffect(() => {
    if (!gameData) return;

    chessGame.load(gameData.fen);
    onGameUpdate(gameData.fen, gameData.lastMove?.from, gameData.lastMove?.to);
  }, [gameData, chessGame, onGameUpdate]);

  return { gameData };
}
