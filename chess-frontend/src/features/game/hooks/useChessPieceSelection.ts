import { useState, useCallback } from 'react';
import type { Chess } from 'chess.js';
import type { Square } from '../types';

/**
 * Hook to handle piece selection and move highlights
 */
export function useChessPieceSelection(chessGame: Chess) {
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

  return {
    moveFrom,
    setMoveFrom,
    optionSquares,
    setOptionSquares,
    getMoveOptions,
    clearSelection,
  };
}
