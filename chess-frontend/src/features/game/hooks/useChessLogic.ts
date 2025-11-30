import type { Chess } from "chess.js";
import type { Game, Square, PlayerColor } from "../types";
import type { User } from "firebase/auth";
import { playerService } from "@/features/player/services/playerService";

interface UseChessLogicProps {
    chessGame: Chess;
    currentUser: User | null;
    gameData: Game | null;
    viewingHistoryIndex: number | null;
}

export function useChessLogic({
    chessGame,
    currentUser,
    gameData,
    viewingHistoryIndex,
}: UseChessLogicProps) {
    
    function getPlayerSide(): PlayerColor | null {
        if (!currentUser || !gameData?.players) return null;
        return playerService.getPlayerSide(currentUser, gameData);
    }

    function isMyPiece(square: Square): boolean {
        const piece = chessGame.get(square);
        if (!piece) return false;

        const mySide = getPlayerSide();
        if (!mySide) return false;

        return piece.color === (mySide === "white" ? "w" : "b");
    }

    function getRemainingTime(side: PlayerColor): number {
        if (!gameData) return 0;
        const currentTurnSide = chessGame.turn() === "w" ? "white" : "black";
        return playerService.getRemainingTime(side, gameData, currentTurnSide);
    }

    function canMove(): boolean {
        if (!currentUser || !gameData?.players) return false;
        if (!gameData.players.white || !gameData.players.black) return false;
        if (viewingHistoryIndex !== null) return false;

        const mySide = getPlayerSide();
        if (!mySide) return false;
        if (getRemainingTime(mySide) <= 0) return false;
        if (gameData?.status === "ended") return false;
        if ((chessGame.turn() === "w" ? "white" : "black") !== mySide) return false;

        return true;
    }

    function getMoveOptions(square: Square): Record<string, React.CSSProperties> | null {
        const moves = chessGame.moves({ square, verbose: true });
        if (!moves || moves.length === 0) return null;

        const newSquares: Record<string, React.CSSProperties> = {};
        for (const m of moves) {
            const isCapture = chessGame.get(m.to) && 
                chessGame.get(m.to)?.color !== chessGame.get(square)?.color;
            
            newSquares[m.to] = {
                background: isCapture
                    ? "radial-gradient(circle, rgba(0, 0, 0, 0.1) 85%, transparent 85%)"
                    : "radial-gradient(circle, rgba(0, 0, 0, 0.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
        }
        newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
        
        return newSquares;
    }

    return {
        getPlayerSide,
        isMyPiece,
        canMove,
        getMoveOptions,
        getRemainingTime,
    };
}
