import { useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "../firebase/config";
import { gameService } from "../services/gameService";
import type { GameSettings } from "../components/CreateGameModal";
import { playerService } from "../services";
import type { User } from "firebase/auth";

/**
 * Hook that ensures a game exists in Firebase.
 * If the game doesn't exist, it creates a new one.
 */
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
