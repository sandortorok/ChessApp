import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db, auth } from "@/lib/firebase/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { PlayerProfileModal } from "@/features/player";
import { EmptyState } from "@/shared/components/game/EmptyState";
import { GamesGrid } from "@/shared/components/game/GamesGrid";
import { GameHistoryHeader } from "../components/GameHistoryHeader";

export default function GameHistory() {
    const [games, setGames] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [profileDropdown, setProfileDropdown] = useState<{
        player: any;
        position: { top: number; left: number };
        gameData?: any;
        playerColor?: "white" | "black";
        openUpwards?: boolean;
    } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => setCurrentUser(user));
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setGames([]);
            setLoading(false);
            return;
        }

        const gamesRef = ref(db, "games");
        const unsub = onValue(gamesRef, (snap) => {
            const val = snap.val() || {};
            const list = Object.entries(val)
                .map(([id, g]: any) => ({ id, ...g }))
                .filter(
                    (g) =>
                        (g.players?.white?.uid === currentUser.uid ||
                        g.players?.black?.uid === currentUser.uid) &&
                        g.status === "ended"
                )
                .sort((a, b) => (b.updatedAt || 0) - (a.createdAt || 0));
            setGames(list);
            setLoading(false);
            console.log("Fetched ended games for user:", currentUser.uid, list);
        });

        return () => unsub();
    }, [currentUser]);

    function openGame(gameId: string) {
        navigate(`/game/${gameId}`);
    }

    const handlePlayerClick = (event: React.MouseEvent, player: any, game?: any, playerColor?: "white" | "black") => {
        if (!player || (!player.name && !player.uid)) {
            return;
        }

        if (profileDropdown && profileDropdown.player.uid === player.uid) {
            setProfileDropdown(null);
            return;
        }

        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 400;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setProfileDropdown({
            player,
            gameData: game,
            playerColor,
            position: {
                top: openUpwards ? rect.top - 8 : rect.bottom + 8,
                left: rect.left,
            },
            openUpwards,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
            <GameHistoryHeader />

            <div className="max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                        <p className="text-emerald-300/70 mt-4">Loading your games...</p>
                    </div>
                ) : games.length === 0 ? (
                    <EmptyState
                        icon="📜"
                        title="No Completed Games"
                        description="Finish a game to see it here!"
                    />
                ) : (
                    <GamesGrid
                        games={games}
                        currentUserId={currentUser?.uid}
                        onPlayerClick={handlePlayerClick}
                        onGameClick={openGame}
                        showResult
                    />
                )}
            </div>

            {/* Profile Modal */}
            {profileDropdown && (
                <PlayerProfileModal
                    player={profileDropdown.player}
                    gameData={profileDropdown.gameData}
                    playerColor={profileDropdown.playerColor}
                    position={profileDropdown.position}
                    openUpwards={profileDropdown.openUpwards}
                    onClose={() => setProfileDropdown(null)}
                />
            )}
        </div>
    );
}
