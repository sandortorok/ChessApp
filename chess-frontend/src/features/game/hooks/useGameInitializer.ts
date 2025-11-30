import { useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { gameService } from "../services/gameService";
import type { GameSettings } from "@/features/lobby";
import { playerService } from "@/features/player/services/playerService";
import type { User } from "firebase/auth";

/** Creates game in Firebase if it doesn't exist, then joins current user */
export function useGameInitializer(
    gameId: string | undefined,
    gameSettings: GameSettings | undefined,
    user: User | null
) {
    useEffect(() => {
        if (!gameId || !user || !gameSettings) return;

        const gameRef = ref(db, `games/${gameId}`);

        get(gameRef)
            .then((snap) => {
                if (!snap.exists()) {
                    console.log("No game found, creating new one.");
                    gameService.createNewGame(gameId, gameSettings).then(() => {
                        playerService.joinGame(gameId, user);
                    });
                }
            })
            .catch((err) => console.error("Error checking game:", err));
    }, [gameId, gameSettings, user]);
}
