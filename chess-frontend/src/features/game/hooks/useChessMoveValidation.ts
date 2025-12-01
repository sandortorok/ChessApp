import { useCallback } from 'react';
import type { Chess } from 'chess.js';
import type { User } from 'firebase/auth';
import type { Square, Game } from '../types';
import { playerService } from '@/features/player/services/playerService';

/**
 * Hook to handle move validation logic
 */
export function useChessMoveValidation(
  chessGame: Chess,
  currentUser: User | null,
  gameData: Game | null
) {
  /**
   * Check if a square contains current user's piece
   */
  const isMyPiece = useCallback(
    (square: Square): boolean => {
      const piece = chessGame.get(square);
      if (!piece) return false;
      if (!currentUser || !gameData?.players) return false;

      const mySide = playerService.getPlayerSide(currentUser, gameData.players);
      if (!mySide) return false;

      const mySideColor = mySide === 'white' ? 'w' : 'b';
      return piece.color === mySideColor;
    },
    [chessGame, currentUser, gameData]
  );

  /**
   * Validate if current user can make a move
   */
  const canMove = useCallback((): boolean => {
    if (!currentUser || !gameData?.players || gameData?.status === 'ended')
      return false;
    if (!gameData.players.white || !gameData.players.black) return false;

    const mySide = playerService.getPlayerSide(currentUser, gameData.players);
    if (!mySide) return false;

    if ((chessGame.turn() === 'w' ? 'white' : 'black') !== mySide) return false;
    if (playerService.getRemainingTime(mySide, gameData) <= 0) return false;

    return true;
  }, [chessGame, currentUser, gameData]);

  return {
    isMyPiece,
    canMove,
  };
}
