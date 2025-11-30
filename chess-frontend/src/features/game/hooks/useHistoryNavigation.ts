import { Chess } from "chess.js";
import type { MoveHistoryType, Game, Square } from "../types";

interface UseHistoryNavigationProps {
    moveHistory: MoveHistoryType[];
    gameData: Game | null;
    chessGame: Chess;
    setChessPosition: (fen: string) => void;
    setLastMoveSquares: (squares: { from: Square; to: Square } | null) => void;
    setViewingHistoryIndex: (index: number | null) => void;
    clearSelection: () => void;
}

export function useHistoryNavigation({
    moveHistory,
    gameData,
    chessGame,
    setChessPosition,
    setLastMoveSquares,
    setViewingHistoryIndex,
    clearSelection,
}: UseHistoryNavigationProps) {
    
    function viewMove(index: number) {
        if (index < 0 || index >= moveHistory.length) return;

        const move = moveHistory[index];
        const tempGame = new Chess();
        tempGame.load(move.fen);

        setChessPosition(move.fen);
        setLastMoveSquares({ from: move.from as Square, to: move.to as Square });
        setViewingHistoryIndex(index);
        clearSelection();
    }

    function goToLatestPosition() {
        if (!gameData) return;

        chessGame.load(gameData.fen);
        setChessPosition(gameData.fen);

        if (gameData.lastMove) {
            setLastMoveSquares({ from: gameData.lastMove.from, to: gameData.lastMove.to });
        }

        setViewingHistoryIndex(null);
        clearSelection();
    }

    return {
        viewMove,
        goToLatestPosition,
    };
}
