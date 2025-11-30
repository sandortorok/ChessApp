import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase/config";
import type { User } from "firebase/auth";
import type { Game, PlayerColor } from "../types";
import { gameService } from "../services/gameService";
import { playerService } from "@/features/player/services/playerService";

interface UseGameActionsProps {
    gameId: string | undefined;
    gameData: Game | null;
    currentUser: User | null;
    moveHistoryLength: number;
    onShowEndModal: () => void;
}

export function useGameActions({
    gameId,
    gameData,
    currentUser,
    moveHistoryLength,
    onShowEndModal,
}: UseGameActionsProps) {
    
    async function handleOfferDraw() {
        if (!gameId || !currentUser || gameData?.status === "ended") return;

        const gameRef = ref(db, `games/${gameId}`);
        await update(gameRef, { drawOfferedBy: currentUser.uid });
    }

    async function handleAcceptDraw() {
        if (!gameId || !gameData) return;

        const gameRef = ref(db, `games/${gameId}`);
        await update(gameRef, {
            status: "ended",
            winner: "draw",
            winReason: "agreement",
            drawOfferedBy: null,
        });

        await gameService.updateFirestoreOnGameEnd(gameId, gameData, "draw");
        onShowEndModal();
    }

    async function handleDeclineDraw() {
        if (!gameId) return;

        const gameRef = ref(db, `games/${gameId}`);
        await update(gameRef, { drawOfferedBy: null });
    }

    async function handleAbort() {
        if (!gameId || !gameData || gameData.status === "ended") return;
        if (moveHistoryLength > 1) return;

        const gameRef = ref(db, `games/${gameId}`);
        await update(gameRef, {
            status: "ended",
            winner: "draw",
            winReason: "aborted",
            updatedAt: Date.now(),
        });

        onShowEndModal();
    }

    async function handleSurrender() {
        if (!gameId || !gameData || !currentUser) return;

        const mySide = playerService.getPlayerSide(currentUser, gameData);
        if (!mySide) return;

        const winner = mySide === "white" ? "black" : "white";
        const gameRef = ref(db, `games/${gameId}`);

        await update(gameRef, {
            status: "ended",
            winner,
            winReason: "resignation",
        });

        await gameService.updateFirestoreOnGameEnd(gameId, gameData, winner);
        onShowEndModal();
    }

    async function handleTimeExpired(side: PlayerColor) {
        if (!gameId || !gameData || gameData.status === "ended") return;

        const winner = side === "white" ? "black" : "white";
        const gameRef = ref(db, `games/${gameId}`);

        await update(gameRef, {
            status: "ended",
            winner,
            winReason: "timeout",
        });

        await gameService.updateFirestoreOnGameEnd(gameId, gameData, winner);
        onShowEndModal();
    }

    return {
        handleOfferDraw,
        handleAcceptDraw,
        handleDeclineDraw,
        handleAbort,
        handleSurrender,
        handleTimeExpired,
    };
}
