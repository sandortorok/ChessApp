import { useState } from "react";
import type { Chess } from "chess.js";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import type { Square, Game } from "../types";
import { gameService } from "../services/gameService";

interface UseMoveHandlersProps {
    chessGame: Chess;
    gameId: string | undefined;
    gameData: Game | null;
    canMove: () => boolean;
    isMyPiece: (square: Square) => boolean;
    getMoveOptions: (square: Square) => Record<string, React.CSSProperties> | null;
    setChessPosition: (fen: string) => void;
    setLastMoveSquares: (squares: { from: Square; to: Square } | null) => void;
}

export function useMoveHandlers({
    chessGame,
    gameId,
    gameData,
    canMove,
    isMyPiece,
    getMoveOptions,
    setChessPosition,
    setLastMoveSquares,
}: UseMoveHandlersProps) {
    const [moveFrom, setMoveFrom] = useState<"" | Square>("");
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
        if (!canMove()) return;
        if (piece && !isMyPiece(square as Square)) return;

        // Deselect if clicking same square
        if (moveFrom === square) {
            setMoveFrom("");
            setOptionSquares({});
            return;
        }

        // Select piece
        if (!moveFrom && piece) {
            const options = getMoveOptions(square as Square);
            if (options) {
                setOptionSquares(options);
                setMoveFrom(square as Square);
            }
            return;
        }

        // Try to move
        const moves = chessGame.moves({ square: moveFrom as Square, verbose: true });
        const found = moves.find((m) => m.from === moveFrom && m.to === square);

        if (!found) {
            const options = getMoveOptions(square as Square);
            setMoveFrom(options ? (square as Square) : "");
            setOptionSquares(options || {});
            return;
        }

        try {
            const move = chessGame.move({ 
                from: moveFrom as Square, 
                to: square as Square, 
                promotion: "q" 
            });
            
            if (move && gameId && gameData) {
                const newFen = chessGame.fen();
                setChessPosition(newFen);
                setLastMoveSquares({ from: moveFrom as Square, to: square as Square });
                gameService.updateGameInDb(gameId, gameData, chessGame, newFen, move);
            }
        } catch {
            // Invalid move
        }

        setMoveFrom("");
        setOptionSquares({});
    }

    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
        if (!canMove() || !isMyPiece(sourceSquare as Square) || !targetSquare) return false;

        try {
            const move = gameService.move(chessGame, sourceSquare, targetSquare);
            if (!move || !gameId || !gameData) return false;

            gameService.updateGameInDb(gameId, gameData, chessGame, chessGame.fen(), move);
            setChessPosition(chessGame.fen());
            setLastMoveSquares({ from: sourceSquare as Square, to: targetSquare as Square });
            setOptionSquares({});
            setMoveFrom("");
            return true;
        } catch {
            return false;
        }
    }

    function clearSelection() {
        setMoveFrom("");
        setOptionSquares({});
    }

    return {
        moveFrom,
        optionSquares,
        onSquareClick,
        onPieceDrop,
        clearSelection,
    };
}
