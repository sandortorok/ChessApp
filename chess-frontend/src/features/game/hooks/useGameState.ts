import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ref, onValue } from "firebase/database";
import { db, auth } from "@/lib/firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";
import type { Game, MoveHistoryType, TimeLeft, Square } from "../types";

export function useGameState(gameId: string | undefined) {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Square; to: Square } | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryType[]>([]);
    const [gameData, setGameData] = useState<Game | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        white: 5 * 60 * 1000,
        black: 5 * 60 * 1000,
    });

    const currentTurn = chessGame.turn() === "w" ? "white" : "black";

    // Auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setCurrentUser);
        return () => unsub();
    }, []);

    // Game listener
    useEffect(() => {
        if (!gameId || !currentUser) return;

        const gameRef = ref(db, `games/${gameId}`);
        const unsubscribe = onValue(gameRef, (snap) => {
            const game: Game = snap.val();
            if (!game) return;

            setChessPosition(game.fen);
            setLastMoveSquares(
                game.lastMove ? { from: game.lastMove.from, to: game.lastMove.to } : null
            );
            chessGame.load(game.fen);

            // Time calculation
            if (game.timeLeft) {
                const elapsed = game.status === "ongoing" ? Date.now() - game.updatedAt : 0;
                const currentTurnSide = chessGame.turn() === "w" ? "white" : "black";
                setTimeLeft({
                    ...game.timeLeft,
                    [currentTurnSide]: Math.max(0, game.timeLeft[currentTurnSide] - elapsed),
                });
            }

            setGameData(game);
            setMoveHistory(game.moves || []);
        });

        return () => unsubscribe();
    }, [gameId, currentUser, chessGame]);

    return {
        chessGame,
        chessPosition,
        setChessPosition,
        lastMoveSquares,
        setLastMoveSquares,
        moveHistory,
        gameData,
        currentUser,
        timeLeft,
        currentTurn,
    };
}
