import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db, auth } from "@/lib/firebase/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { PlayerProfileModal } from "@/features/player";
import { EmptyState } from "@/shared/components/game/EmptyState";
import { GamesGrid } from "@/shared/components/game/GamesGrid";
import { LobbyHeader } from "../components/LobbyHeader";
import CreateGameModal, { type GameSettings } from "../components/CreateGameModal";

export default function Lobby() {
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
    const [showCreateGameModal, setShowCreateGameModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => setCurrentUser(user));
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        const gamesRef = ref(db, "games");
        const unsub = onValue(gamesRef, (snap) => {
            const val = snap.val() || {};
            const list = Object.entries(val)
                .map(([id, g]: any) => {
                    return {
                        id,
                        ...g,
                    };
                })
                .filter((g) => g.status === "waiting" || g.status === "ongoing") // Csak aktív játékok
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Legfrissebb elől
            setGames(list);
            setLoading(false);
            console.log("Fetched active games:", list);
        });
        return () => unsub();
    }, []);

    const handleCreateGameSubmit = (settings: GameSettings) => {
        const newGameId = Date.now().toString();
        console.log("Creating game with settings:", settings);
        navigate(`/game/${newGameId}`, { state: { gameSettings: settings } });
    };

    function joinGame(gameId: string) {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        navigate(`/game/${gameId}`);
    }

    const handleCreateGame = () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        setShowCreateGameModal(true);
    };

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
        const dropdownHeight = 250;
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
            <LobbyHeader onCreateGame={handleCreateGame} />

            <div className="max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                        <p className="text-emerald-300/70 mt-4">Loading games...</p>
                    </div>
                ) : games.length === 0 ? (
                    <EmptyState
                        title="No Active Games"
                        description="Be the first to create a game!"
                        actionLabel="Create Game"
                        onAction={handleCreateGame}
                    />
                ) : (
                    <GamesGrid
                        games={games}
                        currentUserId={currentUser?.uid}
                        onPlayerClick={handlePlayerClick}
                        onGameClick={joinGame}
                        showJoinButton
                        showStatus
                        showTimeControl
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

            <CreateGameModal
                isOpen={showCreateGameModal}
                onClose={() => setShowCreateGameModal(false)}
                onCreate={handleCreateGameSubmit}
            />
        </div>
    );
}