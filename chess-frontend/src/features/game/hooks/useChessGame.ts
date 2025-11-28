/**
 * useChessGame Hook
 * Main hook that combines all game-related hooks and logic
 */

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../../firebase/config";
import type { winReason, Square } from "../../../core/types";
import type { GameSettings } from "../../../components/CreateGameModal";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { playerService } from "../../../services/playerService";
import { gameService } from "../../../services/gameService";
import { useGameState } from "./useGameState";
import { useGameActions } from "./useGameActions";
import { useMoveHistory } from "./useMoveHistory";

interface UseChessGameProps {
    gameId: string | undefined;
    gameSettings?: GameSettings;
}

export function useChessGame({ gameId, gameSettings }: UseChessGameProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [moveFrom, setMoveFrom] = useState<"" | Square>("");
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [showEndModal, setShowEndModal] = useState(false);
    const [winReasonState, setWinReason] = useState<winReason>("checkmate");
    const [eloChanges, setEloChanges] = useState<{ whiteChange: number; blackChange: number } | null>(null);
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
    const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);
    const [prevStatus, setPrevStatus] = useState<string | undefined>(undefined);

    // Auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);

    // Create temporary viewingHistoryIndex for gameState (will be updated by useMoveHistory)
    const [tempViewingIndex, setTempViewingIndex] = useState<number | null>(null);

    // Game state hook
    const {
        gameData,
        chessGame,
        chessPosition,
        setChessPosition,
        moveHistory,
        timeLeft,
        lastMoveSquares,
        setLastMoveSquares,
        currentTurn
    } = useGameState({
        gameId,
        currentUser,
        gameSettings,
        viewingHistoryIndex: tempViewingIndex
    });

    // Move history hook
    const {
        viewingHistoryIndex,
        viewMove,
        goToLatestPosition
    } = useMoveHistory({
        gameData,
        chessGame,
        moveHistory,
        setChessPosition,
        setLastMoveSquares,
        setOptionSquares,
        setMoveFrom
    });

    // Sync viewingHistoryIndex with tempViewingIndex
    useEffect(() => {
        setTempViewingIndex(viewingHistoryIndex);
    }, [viewingHistoryIndex]);

    // Game actions hook
    const {
        updateGameInDb,
        handleOfferDraw,
        handleAcceptDraw,
        handleDeclineDraw,
        handleAbort,
        handleSurrender,
        confirmSurrender,
        handleTimeExpired,
        canMove
    } = useGameActions({
        gameId,
        gameData,
        chessGame,
        currentUser,
        setEloChanges,
        setWinReason,
        setShowEndModal,
        setShowSurrenderConfirm,
        setShowDrawOfferModal,
        moveHistoryLength: moveHistory.length
    });

    // Save starting ELO when both players joined
    useEffect(() => {
        if (!gameId || !gameData || gameData.startingElo) return;

        const bothPlayersJoined = gameData.players?.white && gameData.players?.black;
        if (!bothPlayersJoined) return;

        async function saveStartingElo() {
            if (!gameId || !gameData?.players?.white || !gameData?.players?.black) return;

            try {
                await gameService.saveStartingElo(
                    gameId, 
                    gameData.players.white.uid, 
                    gameData.players.black.uid
                );
            } catch (error) {
                console.error("Error saving starting ELO:", error);
            }
        }

        saveStartingElo();
    }, [gameId, gameData?.players, gameData?.startingElo]);

    // Game end modal display
    useEffect(() => {
        if (!gameData) return;

        if (gameData.status === "ended" && !showEndModal && prevStatus !== "ended") {
            setWinReason(gameData.winReason || "checkmate");
            setShowEndModal(true);
        }
        setPrevStatus(gameData.status);
    }, [gameData?.status, showEndModal, prevStatus]);

    // Draw offer listener
    useEffect(() => {
        if (!gameData || !currentUser) return;

        if (gameData.drawOfferedBy && gameData.drawOfferedBy !== currentUser.uid) {
            setDrawOfferedBy(gameData.drawOfferedBy);
            setShowDrawOfferModal(true);
        } else if (!gameData.drawOfferedBy) {
            setShowDrawOfferModal(false);
            setDrawOfferedBy(null);
        }
    }, [gameData?.drawOfferedBy, currentUser]);

    // Check if piece belongs to current user
    const isMyPiece = useCallback((square: Square): boolean => {
        const piece = chessGame.get(square);
        if (!piece) return false;
        if (!currentUser || !gameData?.players) return false;
        
        const mySide = playerService.getPlayerSide(currentUser, gameData);
        if (!mySide) return false;
        
        const mySideColor = mySide === "white" ? "w" : "b";
        return piece.color === mySideColor;
    }, [chessGame, currentUser, gameData]);

    // Get move options for a square
    const getMoveOptions = useCallback((square: Square): boolean => {
        const moves = chessGame.moves({ square, verbose: true });
        if (!moves || moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};
        for (const m of moves) {
            newSquares[m.to] = {
                background:
                    chessGame.get(m.to) && chessGame.get(m.to)?.color !== chessGame.get(square)?.color
                        ? "radial-gradient(circle, rgba(0, 0, 0, 0.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0, 0, 0, 0.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
        }
        newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
        setOptionSquares(newSquares);
        return true;
    }, [chessGame]);

    // Handle square click
    const onSquareClick = useCallback(({ square, piece }: SquareHandlerArgs): void => {
        if (!canMove()) return;
        if (viewingHistoryIndex !== null) return;

        if (piece && !isMyPiece(square as Square)) return;
        if (moveFrom && !isMyPiece(moveFrom)) return;

        if (moveFrom === square) {
            setMoveFrom("");
            setOptionSquares({});
            return;
        }

        if (!moveFrom && piece) {
            const has = getMoveOptions(square as Square);
            if (has) setMoveFrom(square as Square);
            return;
        }

        const moves = chessGame.moves({ square: moveFrom as Square, verbose: true });
        const found = moves.find((m) => m.from === moveFrom && m.to === square);

        if (!found) {
            const has = getMoveOptions(square as Square);
            setMoveFrom(has ? (square as Square) : "");
            return;
        }

        try {
            const move = chessGame.move({ from: moveFrom as Square, to: square as Square, promotion: "q" });
            if (!move) return;
            const newFen = chessGame.fen();
            setChessPosition(newFen);
            setLastMoveSquares({ from: moveFrom as Square, to: square as Square });
            updateGameInDb(newFen, move);
            setMoveFrom("");
            setOptionSquares({});
        } catch {
            const has = getMoveOptions(square as Square);
            setMoveFrom(has ? (square as Square) : "");
        }
    }, [canMove, viewingHistoryIndex, isMyPiece, moveFrom, getMoveOptions, chessGame, setChessPosition, setLastMoveSquares, updateGameInDb]);

    // Handle piece drop
    const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
        if (!canMove()) return false;
        if (viewingHistoryIndex !== null) return false;

        if (!isMyPiece(sourceSquare as Square)) return false;
        if (!targetSquare) return false;

        try {
            const move = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
            if (!move) return false;
            const newFen = chessGame.fen();
            setChessPosition(newFen);
            setLastMoveSquares({ from: sourceSquare as Square, to: targetSquare as Square });
            updateGameInDb(newFen, move);
            setOptionSquares({});
            setMoveFrom("");
            return true;
        } catch {
            return false;
        }
    }, [canMove, viewingHistoryIndex, isMyPiece, chessGame, setChessPosition, setLastMoveSquares, updateGameInDb]);

    // Placeholder handlers
    const handleNewGame = useCallback((): void => {
        console.log("New game...");
        // TODO: Implement
    }, []);

    const handleRematch = useCallback((): void => {
        console.log("Rematch...");
        // TODO: Implement
    }, []);

    return {
        // State
        gameData,
        currentUser,
        chessPosition,
        optionSquares,
        lastMoveSquares,
        moveHistory,
        viewingHistoryIndex,
        timeLeft,
        currentTurn,
        showEndModal,
        winReason: winReasonState,
        eloChanges,
        showSurrenderConfirm,
        showDrawOfferModal,
        drawOfferedBy,
        
        // Actions
        onSquareClick,
        onPieceDrop,
        viewMove,
        goToLatestPosition,
        handleTimeExpired,
        handleOfferDraw,
        handleAbort,
        handleSurrender,
        confirmSurrender,
        handleAcceptDraw,
        handleDeclineDraw,
        handleNewGame,
        handleRematch,
        setShowEndModal,
        setShowSurrenderConfirm
    };
}
