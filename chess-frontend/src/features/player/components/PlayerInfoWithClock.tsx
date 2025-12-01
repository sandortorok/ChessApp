import PlayerInfo from "./PlayerInfo";
import { ChessClock, useGamePropSelector, DEFAULT_GAME } from "@/features/game";
import { getPlayerData } from "@/features/game/utils/gameLayoutHelpers";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ref, update } from "firebase/database";
import { useParams } from "react-router-dom";
import { gameService } from "@/features/game/services/gameService";

interface PlayerInfoWithClockProps {
    position: "top" | "bottom";
}

export default function PlayerInfoWithClock({
    position,
}: PlayerInfoWithClockProps) {
    const { gameId } = useParams<{ gameId: string }>();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);
    const gameData = useGamePropSelector(game => game, DEFAULT_GAME);

    // Get all player data for the position
    const {
        player,
        playerColor,
        startingElo,
        currentElo,
        eloChange,
        initialTime,
        active
    } = getPlayerData(currentUser, gameData, position);

    // Handle time expiration
    async function handleTimeExpired() {
        if (!gameId || !gameData || gameData.status === "ended") return;

        const gameRef = ref(db, `games/${gameId}`);
        const winner = playerColor === "white" ? "black" : "white";

        try {
            await update(gameRef, {
                status: "ended",
                winner,
                winReason: "timeout"
            });

            // Update Firestore
            await gameService.updateFirestoreOnGameEnd(gameId, gameData, winner);
        } catch (err) {
            console.error("Error updating game on timeout:", err);
        }
    }

    return (
        <div className="w-full max-w-[470px] mx-auto relative backdrop-blur-xl bg-gray-900/30 rounded-xl p-3 border border-teal-500/20 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 pointer-events-none" />
            <div className="relative flex justify-start items-center gap-4 z-10">
                <PlayerInfo
                    color={playerColor}
                    player={player || null}
                    position={position}
                    startingElo={startingElo}
                    currentElo={currentElo}
                    eloChange={eloChange}
                />
                <div className="ml-auto">
                    <ChessClock
                        initialTime={initialTime}
                        active={active}
                        onTimeExpired={handleTimeExpired}
                    />
                </div>
            </div>
        </div>
    );
}
