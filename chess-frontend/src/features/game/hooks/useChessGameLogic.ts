import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { User } from 'firebase/auth';
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import type { Square, Game } from '../types';
import { gameMoveService } from '../services/gameMoveService';
import { playerService } from '@/features/player/services/playerService';

/**
 * Hook to manage chess game logic and board interactions
 * Handles piece movement, move validation, and visual feedback
 */
export function useChessGameLogic(
  chessGame: Chess,
  gameId: string | undefined,
  gameData: Game | null,
  currentUser: User | null,
  viewingHistoryIndex: number | null,
  onRenderMove: (
    fen: string,
    from?: Square,
    to?: Square,
    index?: number | null
  ) => void
) {
  const [moveFrom, setMoveFrom] = useState<'' | Square>('');
  const [optionSquares, setOptionSquares] = useState<
    Record<string, React.CSSProperties>
  >({});

  /**
   * Clear move selection and highlights
   */
  const clearSelection = useCallback(() => {
    setMoveFrom('');
    setOptionSquares({});
  }, []);

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

  /**
   * Get and highlight legal moves for a piece
   */
  const getMoveOptions = useCallback(
    (square: Square): boolean => {
      const moves = chessGame.moves({ square, verbose: true });
      if (!moves || moves.length === 0) {
        setOptionSquares({});
        return false;
      }

      const newSquares: Record<string, React.CSSProperties> = {};
      for (const m of moves) {
        newSquares[m.to] = {
          background:
            chessGame.get(m.to) &&
            chessGame.get(m.to)?.color !== chessGame.get(square)?.color
              ? 'radial-gradient(circle, rgba(0, 0, 0, 0.1) 85%, transparent 85%)'
              : 'radial-gradient(circle, rgba(0, 0, 0, 0.1) 25%, transparent 25%)',
          borderRadius: '50%',
        };
      }
      newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };
      setOptionSquares(newSquares);
      return true;
    },
    [chessGame]
  );

  /**
   * Handle square click for piece selection and move
   */
  const onSquareClick = useCallback(
    ({ square, piece }: SquareHandlerArgs) => {
      if (!canMove() || viewingHistoryIndex !== null) return;
      if (piece && !isMyPiece(square as Square)) return;
      if (moveFrom && !isMyPiece(moveFrom)) return;

      // Deselect piece
      if (moveFrom === square) {
        setMoveFrom('');
        setOptionSquares({});
        return;
      }

      // Select piece
      if (!moveFrom && piece) {
        const has = getMoveOptions(square as Square);
        if (has) setMoveFrom(square as Square);
        return;
      }

      // Try to make move
      try {
        const move = chessGame.move({
          from: moveFrom as Square,
          to: square as Square,
          promotion: 'q',
        });
        if (!move) return;

        const newFen = chessGame.fen();
        onRenderMove(newFen, move.from, move.to);
        gameMoveService.updateGameInDb(
          gameId!,
          gameData!,
          chessGame,
          newFen,
          move
        );
      } catch {
        const has = getMoveOptions(square as Square);
        setMoveFrom(has ? (square as Square) : '');
      }
    },
    [
      canMove,
      viewingHistoryIndex,
      isMyPiece,
      moveFrom,
      getMoveOptions,
      chessGame,
      gameId,
      gameData,
      onRenderMove,
    ]
  );

  /**
   * Handle drag-and-drop piece movement
   */
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!canMove()) return false;
      if (viewingHistoryIndex !== null) return false;
      if (!isMyPiece(sourceSquare as Square)) return false;
      if (!targetSquare) return false;

      try {
        const move = gameMoveService.move(
          chessGame,
          sourceSquare,
          targetSquare
        );
        if (!move) return false;

        gameMoveService.updateGameInDb(
          gameId!,
          gameData!,
          chessGame,
          chessGame.fen(),
          move
        );
        onRenderMove(chessGame.fen(), move.from, move.to);
        return true;
      } catch {
        return false;
      }
    },
    [
      canMove,
      viewingHistoryIndex,
      isMyPiece,
      chessGame,
      gameId,
      gameData,
      onRenderMove,
    ]
  );

  return {
    moveFrom,
    optionSquares,
    onSquareClick,
    onPieceDrop,
    clearSelection,
  };
}
