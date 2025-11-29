import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { EmptyState } from "@/shared/components/game/EmptyState";
import { GamesGrid } from "@/shared/components/game/GamesGrid";
import { GameHistoryHeader } from "../components/GameHistoryHeader";
import { isGuest } from "@/shared/utils/gameHelpers";

export default function MyGames() {
    const [games, setGames] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userLoading, setUserLoading] = useState(true);
    const [gamesLoading, setGamesLoading] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState<{
        player: any;
        position: { top: number; left: number };
        gameData?: any;
        playerColor?: "white" | "black";
        openUpwards?: boolean;
    } | null>(null);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdown(null);
            }
        }

        if (profileDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileDropdown]);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setUserLoading(false);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setGames([]);
            return;
        }

        setGamesLoading(true);
        const gamesRef = ref(db, "games");
        const unsub = onValue(gamesRef, (snap) => {
            const val = snap.val() || {};
            const list = Object.entries(val)
                .map(([id, g]: any) => ({ id, ...g }))
                .filter(
                    (g) =>
                        // Csak a saját "ended" státuszú meccsek
                        (g.players?.white?.uid === currentUser.uid ||
                        g.players?.black?.uid === currentUser.uid) &&
                        g.status === "ended"
                )
                .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)); // Legfrissebb elől
            setGames(list);
            setGamesLoading(false);
            console.log("Fetched ended games for user:", currentUser.uid, list);
        });

        return () => unsub();
    }, [currentUser]);

    const openGame = (gameId: string) => {
        navigate(`/game/${gameId}`);
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
                {userLoading || gamesLoading ? (
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

            {/* Profile Dropdown */}
            {profileDropdown && (
                <div
                    ref={dropdownRef}
                    className="fixed z-50 bg-slate-800 border border-emerald-600/50 rounded-lg shadow-xl shadow-emerald-500/20 p-4 min-w-[280px] max-h-[80vh] overflow-y-auto"
                    style={{
                        [profileDropdown.openUpwards ? 'bottom' : 'top']: profileDropdown.openUpwards 
                            ? `${window.innerHeight - profileDropdown.position.top}px`
                            : `${profileDropdown.position.top}px`,
                        left: `${profileDropdown.position.left}px`,
                    }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center text-2xl">
                            {isGuest(profileDropdown.player) ? "🎮" : "👤"}
                        </div>
                        <div>
                            <p className="text-white font-semibold">
                                {profileDropdown.player.name || profileDropdown.player.displayName || profileDropdown.player.email?.split('@')[0] || "Guest"}
                            </p>
                            {!isGuest(profileDropdown.player) && (
                                <div className="flex items-center gap-2">
                                    <p className="text-emerald-400 text-sm font-medium">
                                        ELO: {
                                            profileDropdown.gameData?.finalElo?.[profileDropdown.playerColor!] ||
                                            profileDropdown.player.elo ||
                                            1200
                                        }
                                    </p>
                                    {profileDropdown.gameData?.status === "ended" && 
                                     profileDropdown.gameData?.finalElo?.[profileDropdown.playerColor!] && 
                                     profileDropdown.gameData?.startingElo?.[profileDropdown.playerColor!] && (
                                        <span className={`text-xs font-bold ${
                                            (profileDropdown.gameData.finalElo[profileDropdown.playerColor!] - 
                                             profileDropdown.gameData.startingElo[profileDropdown.playerColor!]) > 0 
                                                ? 'text-green-400' 
                                                : 'text-red-400'
                                        }`}>
                                            ({(profileDropdown.gameData.finalElo[profileDropdown.playerColor!] - 
                                               profileDropdown.gameData.startingElo[profileDropdown.playerColor!]) > 0 ? '+' : ''}
                                            {profileDropdown.gameData.finalElo[profileDropdown.playerColor!] - 
                                             profileDropdown.gameData.startingElo[profileDropdown.playerColor!]})
                                        </span>
                                    )}
                                </div>
                            )}
                            {isGuest(profileDropdown.player) && (
                                <p className="text-slate-400 text-sm">
                                    🎮 Guest Player
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="border-t border-emerald-600/30 pt-3 space-y-2">
                        {profileDropdown.gameData?.startingElo?.[profileDropdown.playerColor!] && (
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-300/70">Starting ELO:</span>
                                <span className="text-white font-semibold">
                                    {profileDropdown.gameData.startingElo[profileDropdown.playerColor!]}
                                </span>
                            </div>
                        )}
                        {profileDropdown.gameData?.finalElo?.[profileDropdown.playerColor!] && 
                         profileDropdown.gameData?.startingElo?.[profileDropdown.playerColor!] && (
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-300/70">Final ELO:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold">
                                        {profileDropdown.gameData.finalElo[profileDropdown.playerColor!]}
                                    </span>
                                    <span className={`text-xs font-bold ${
                                        (profileDropdown.gameData.finalElo[profileDropdown.playerColor!] - 
                                         profileDropdown.gameData.startingElo[profileDropdown.playerColor!]) > 0 
                                            ? 'text-green-400' 
                                            : 'text-red-400'
                                    }`}>
                                        ({(profileDropdown.gameData.finalElo[profileDropdown.playerColor!] - 
                                           profileDropdown.gameData.startingElo[profileDropdown.playerColor!]) > 0 ? '+' : ''}
                                        {profileDropdown.gameData.finalElo[profileDropdown.playerColor!] - 
                                         profileDropdown.gameData.startingElo[profileDropdown.playerColor!]})
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-300/70">User ID:</span>
                            <span className="text-white font-mono">{profileDropdown.player.uid?.slice(0, 8) || "N/A"}</span>
                        </div>
                        {profileDropdown.player.wins !== undefined && (
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-300/70">Wins:</span>
                                <span className="text-white">{profileDropdown.player.wins || 0}</span>
                            </div>
                        )}
                        {profileDropdown.player.losses !== undefined && (
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-300/70">Losses:</span>
                                <span className="text-white">{profileDropdown.player.losses || 0}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Scrollbar Style */}
            <style>{`
                /* Custom scrollbar for dropdown */
                .fixed.z-50::-webkit-scrollbar {
                    width: 6px;
                }
                .fixed.z-50::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 3px;
                }
                .fixed.z-50::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.5);
                    border-radius: 3px;
                }
                .fixed.z-50::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.7);
                }
            `}</style>
        </div>
    );
}
