/**
 * useGameState Hook
 * Handles Firebase game state subscription and management
 */

import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ref, onValue, get } from "firebase/database";
import { db } from "../../../firebase/config";
import type { User } from "firebase/auth";
import type { Game, MoveHistoryType, Square } from "../../../core/types";
import type { GameSettings } from "../../../components/CreateGameModal";
import { gameService } from "../../../services/gameService";
import { playerService } from "../../../services/playerService";

interface UseGameStateProps {
    gameId: string | undefined;
    currentUser: User | null;
    gameSettings?: GameSettings;
    viewingHistoryIndex: number | null;
}

interface UseGameStateReturn {
    gameData: Game | null;
    chessGame: Chess;
    chessPosition: string;
    setChessPosition: React.Dispatch<React.SetStateAction<string>>;
    moveHistory: MoveHistoryType[];
    timeLeft: { white: number; black: number };
    setTimeLeft: React.Dispatch<React.SetStateAction<{ white: number; black: number }>>;
    lastMoveSquares: { from: Square; to: Square } | null;
    setLastMoveSquares: React.Dispatch<React.SetStateAction<{ from: Square; to: Square } | null>>;
    currentTurn: "white" | "black";
}

export function useGameState({
    gameId,
    currentUser,
    gameSettings,
    viewingHistoryIndex
}: UseGameStateProps): UseGameStateReturn {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Square; to: Square } | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryType[]>([]);
    const [gameData, setGameData] = useState<Game | null>(null);
    const [timeLeft, setTimeLeft] = useState<{ white: number; black: number }>({
        white: 5 * 60 * 1000,
        black: 5 * 60 * 1000,
    });

    const currentTurn = chessGame.turn() === "w" ? "white" : "black";

    // Game listener
    useEffect(() => {
        if (!gameId || !currentUser) return;

        const gameRef = ref(db, `games/${gameId}`);

        get(gameRef)
            .then((snap) => {
                if (!snap.exists()) {
                    console.log("No game found, creating new one.");
                    gameService.createNewGame(gameId, gameSettings);
                }
            })
            .catch((err) => console.error("Error checking game:", err));

        const unsubscribe = onValue(gameRef, async (snap) => {
            const game = snap.val();
            if (!game) return;
            
            // Update FEN first to ensure correct turn calculation
            if (game.fen && viewingHistoryIndex === null) {
                chessGame.load(game.fen);
            }
            
            // Only calculate time if game is started and ongoing
            if (game.timeLeft && game.updatedAt && game.started && game.status !== "ended") {
                const now = Date.now();
                const elapsed = now - game.updatedAt;

                const currentTurn = chessGame.turn() === "w" ? "white" : "black";
                const newTimeLeft = {
                    white: game.timeLeft.white,
                    black: game.timeLeft.black,
                    [currentTurn]: Math.max(0, game.timeLeft[currentTurn] - elapsed),
                };
                setTimeLeft(newTimeLeft);
            } else if (game.timeLeft) {
                setTimeLeft(game.timeLeft);
            }
            setGameData(game);

            // Load move history
            if (game.moves && Array.isArray(game.moves)) {
                setMoveHistory(game.moves);
            }

            // Update position if not viewing history
            if (viewingHistoryIndex === null) {
                if (game.fen && game.fen !== chessPosition) {
                    setChessPosition(game.fen);
                }

                if (game.lastMove) {
                    setLastMoveSquares({ from: game.lastMove.from, to: game.lastMove.to });
                }
            }

            // Join game
            await playerService.joinGame(gameId, currentUser, game);
        });

        return () => unsubscribe();
    }, [gameId, currentUser]);

    return {
        gameData,
        chessGame,
        chessPosition,
        setChessPosition,
        moveHistory,
        timeLeft,
        setTimeLeft,
        lastMoveSquares,
        setLastMoveSquares,
        currentTurn
    };
}
