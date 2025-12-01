import { useCallback } from 'react';
import { Chess } from 'chess.js';
import type { User } from 'firebase/auth';
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import type { Square, Game } from '../types';
import { gameMoveService } from '../services/gameMoveService';
import { useChessPieceSelection } from './useChessPieceSelection';
import { useChessMoveValidation } from './useChessMoveValidation';

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
  const {
    moveFrom,
    setMoveFrom,
    optionSquares,
    getMoveOptions,
    clearSelection,
  } = useChessPieceSelection(chessGame);

  const { isMyPiece, canMove } = useChessMoveValidation(
    chessGame,
    currentUser,
    gameData
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
