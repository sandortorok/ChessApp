/**
 * useGameActions Hook
 * Handles game actions like moves, surrender, draw offers, etc.
 */

import { useCallback } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../../firebase/config";
import type { User } from "firebase/auth";
import type { Chess, Move } from "chess.js";
import type { Game, winReason } from "../../../core/types";
import { gameService } from "../../../services/gameService";
import { playerService } from "../../../services/playerService";

interface UseGameActionsProps {
    gameId: string | undefined;
    gameData: Game | null;
    chessGame: Chess;
    currentUser: User | null;
    setEloChanges: (changes: { whiteChange: number; blackChange: number } | null) => void;
    setWinReason: (reason: winReason) => void;
    setShowEndModal: (show: boolean) => void;
    setShowSurrenderConfirm: (show: boolean) => void;
    setShowDrawOfferModal: (show: boolean) => void;
    moveHistoryLength: number;
}

interface UseGameActionsReturn {
    updateGameInDb: (fen: string, move: Move) => Promise<void>;
    handleOfferDraw: () => Promise<void>;
    handleAcceptDraw: () => Promise<void>;
    handleDeclineDraw: () => Promise<void>;
    handleAbort: () => Promise<void>;
    handleSurrender: () => void;
    confirmSurrender: () => Promise<void>;
    handleTimeExpired: (side: "white" | "black") => Promise<void>;
    canMove: () => boolean;
    getRemainingTime: (side: "white" | "black") => number;
}

export function useGameActions({
    gameId,
    gameData,
    chessGame,
    currentUser,
    setEloChanges,
    setWinReason,
    setShowEndModal,
    setShowSurrenderConfirm,
    setShowDrawOfferModal,
    moveHistoryLength
}: UseGameActionsProps): UseGameActionsReturn {

    const getRemainingTime = useCallback((side: "white" | "black"): number => {
        if (!gameData) return 0;
        const currentTurnSide = chessGame.turn() === "w" ? "white" : "black";
        return playerService.getRemainingTime(side, gameData, currentTurnSide);
    }, [gameData, chessGame]);

    const canMove = useCallback((): boolean => {
        if (!currentUser || !gameData?.players) return false;
        if (!gameData.players.white || !gameData.players.black) return false;

        const mySide = playerService.getPlayerSide(currentUser, gameData);
        if (!mySide) return false;
        if (getRemainingTime(mySide) <= 0) return false;
        if (gameData?.status === "ended") return false;
        if ((chessGame.turn() === "w" ? "white" : "black") !== mySide) return false;

        return true;
    }, [currentUser, gameData, chessGame, getRemainingTime]);

    const updateGameInDb = useCallback(async (fen: string, move: Move): Promise<void> => {
        if (!gameId || !gameData) return;
        
        const eloChanges = await gameService.updateGameInDb(gameId, gameData, chessGame, fen, move);
        
        if (eloChanges) {
            setEloChanges(eloChanges);
        }
    }, [gameId, gameData, chessGame, setEloChanges]);

    const updateFirestoreOnGameEnd = useCallback(async (winner: "white" | "black" | "draw" | null): Promise<{ whiteChange: number; blackChange: number } | null> => {
        if (!gameId || !gameData) return null;
        return await gameService.updateFirestoreOnGameEnd(gameId, gameData, winner);
    }, [gameId, gameData]);

    const handleOfferDraw = useCallback(async (): Promise<void> => {
        if (!canMove() || !gameId || !gameData || gameData.status === "ended" || !currentUser) return;
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            await update(gameRef, {
                drawOfferedBy: currentUser.uid,
            });
            console.log("Draw offered by:", currentUser.uid);
        } catch (err) {
            console.error("Error offering draw:", err);
        }
    }, [canMove, gameId, gameData, currentUser]);

    const handleAcceptDraw = useCallback(async (): Promise<void> => {
        if (!gameId || !gameData) return;
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            await update(gameRef, {
                status: "ended",
                winner: "draw",
                winReason: "aggreement",
                drawOfferedBy: null,
            });
            
            const changes = await updateFirestoreOnGameEnd("draw");
            if (changes) {
                setEloChanges(changes);
            }
            
            setWinReason("aggreement");
            setShowDrawOfferModal(false);
            setShowEndModal(true);
        } catch (err) {
            console.error("Error accepting draw:", err);
        }
    }, [gameId, gameData, updateFirestoreOnGameEnd, setEloChanges, setWinReason, setShowDrawOfferModal, setShowEndModal]);

    const handleDeclineDraw = useCallback(async (): Promise<void> => {
        if (!gameId) return;
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            await update(gameRef, {
                drawOfferedBy: null,
            });
            setShowDrawOfferModal(false);
        } catch (err) {
            console.error("Error declining draw:", err);
        }
    }, [gameId, setShowDrawOfferModal]);

    const handleAbort = useCallback(async (): Promise<void> => {
        if (!gameId || !gameData || gameData.status === "ended" || !currentUser) return;
        if (moveHistoryLength > 1) return;
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            await update(gameRef, {
                status: "ended",
                winner: "draw",
                winReason: "aborted",
                updatedAt: Date.now(),
            });
            
            setWinReason("aborted");
            setShowEndModal(true);
        } catch (err) {
            console.error("Error aborting game:", err);
        }
    }, [gameId, gameData, currentUser, moveHistoryLength, setWinReason, setShowEndModal]);

    const handleSurrender = useCallback((): void => {
        if (!currentUser || !gameData?.players || gameData.status === "ended") return;
        
        const mySide = playerService.getPlayerSide(currentUser, gameData);
        if (!mySide) return;
        
        setShowSurrenderConfirm(true);
    }, [currentUser, gameData, setShowSurrenderConfirm]);

    const confirmSurrender = useCallback(async (): Promise<void> => {
        if (!gameId || !gameData || !currentUser) return;
        
        setShowSurrenderConfirm(false);
        
        const gameRef = ref(db, `games/${gameId}`);
        const mySide = playerService.getPlayerSide(currentUser, gameData);
        if (!mySide) return;
        
        const winner = mySide === "white" ? "black" : "white";
        
        try {
            await update(gameRef, {
                status: "ended",
                winner,
                winReason: "resignation",
            });
            
            const changes = await updateFirestoreOnGameEnd(winner);
            if (changes) {
                setEloChanges(changes);
            }
            
            setWinReason("resignation");
            setShowEndModal(true);
        } catch (err) {
            console.error("Error updating game on surrender:", err);
        }
    }, [gameId, gameData, currentUser, updateFirestoreOnGameEnd, setEloChanges, setWinReason, setShowEndModal, setShowSurrenderConfirm]);

    const handleTimeExpired = useCallback(async (side: "white" | "black"): Promise<void> => {
        if (!gameId || gameData?.status === "ended") return;

        const gameRef = ref(db, `games/${gameId}`);
        const winner = side === "white" ? "black" : "white";

        try {
            await update(gameRef, {
                status: "ended",
                winner,
                winReason: "timeout"
            });
            
            const changes = await updateFirestoreOnGameEnd(winner);
            if (changes) {
                setEloChanges(changes);
            }
            
            setWinReason("timeout");
            setShowEndModal(true);
        } catch (err) {
            console.error("Error updating game on timeout:", err);
        }
    }, [gameId, gameData, updateFirestoreOnGameEnd, setEloChanges, setWinReason, setShowEndModal]);

    return {
        updateGameInDb,
        handleOfferDraw,
        handleAcceptDraw,
        handleDeclineDraw,
        handleAbort,
        handleSurrender,
        confirmSurrender,
        handleTimeExpired,
        canMove,
        getRemainingTime
    };
}
