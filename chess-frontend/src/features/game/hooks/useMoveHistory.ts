/**
 * useMoveHistory Hook
 * Handles move history navigation
 */

import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import type { Game, MoveHistoryType, Square } from "../../../core/types";

interface UseMoveHistoryProps {
    gameData: Game | null;
    chessGame: Chess;
    moveHistory: MoveHistoryType[];
    setChessPosition: (fen: string) => void;
    setLastMoveSquares: (squares: { from: Square; to: Square } | null) => void;
    setOptionSquares: (squares: Record<string, React.CSSProperties>) => void;
    setMoveFrom: (square: "" | Square) => void;
}

interface UseMoveHistoryReturn {
    viewingHistoryIndex: number | null;
    setViewingHistoryIndex: React.Dispatch<React.SetStateAction<number | null>>;
    viewMove: (index: number) => void;
    goToLatestPosition: () => void;
}

export function useMoveHistory({
    gameData,
    chessGame,
    moveHistory,
    setChessPosition,
    setLastMoveSquares,
    setOptionSquares,
    setMoveFrom
}: UseMoveHistoryProps): UseMoveHistoryReturn {
    const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(null);

    const viewMove = useCallback((index: number): void => {
        if (index < 0 || index >= moveHistory.length) return;

        const move = moveHistory[index];
        const tempGame = new Chess();
        tempGame.load(move.fen);

        setChessPosition(move.fen);
        setLastMoveSquares({ from: move.from as Square, to: move.to as Square });
        setViewingHistoryIndex(index);
        setOptionSquares({});
        setMoveFrom("");
    }, [moveHistory, setChessPosition, setLastMoveSquares, setOptionSquares, setMoveFrom]);

    const goToLatestPosition = useCallback((): void => {
        if (!gameData) return;

        chessGame.load(gameData.fen);
        setChessPosition(gameData.fen);

        if (gameData.lastMove) {
            setLastMoveSquares({ from: gameData.lastMove.from, to: gameData.lastMove.to });
        }

        setViewingHistoryIndex(null);
        setOptionSquares({});
        setMoveFrom("");
    }, [gameData, chessGame, setChessPosition, setLastMoveSquares, setOptionSquares, setMoveFrom]);

    return {
        viewingHistoryIndex,
        setViewingHistoryIndex,
        viewMove,
        goToLatestPosition
    };
}
