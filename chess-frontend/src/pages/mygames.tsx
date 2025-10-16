import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function MyGames() {
    const [games, setGames] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [profileDropdown, setProfileDropdown] = useState<{
        player: any;
        position: { top: number; left: number };
        gameData?: any;
        playerColor?: "white" | "black";
        openUpwards?: boolean;
    } | null>(null);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Helper: check if player is guest (uid starts with "guest_")
    const isGuest = (player: any) => {
        return player?.uid?.startsWith("guest_");
    };

    // Helper: format timestamp to relative time
    const formatTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    };

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
        const unsubAuth = onAuthStateChanged(auth, (user) => setCurrentUser(user));
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

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
            console.log("Fetched ended games for user:", currentUser.uid, list);
        });

        return () => unsub();
    }, [currentUser]);

    function openGame(gameId: string) {
        navigate(`/game/${gameId}`);
    }

    function handlePlayerClick(event: React.MouseEvent, player: any, game?: any, playerColor?: "white" | "black") {
        event.stopPropagation();
        
        if (!player || (!player.name && !player.uid)) {
            return;
        }

        // Ha ugyanarra a profilra kattintunk, zárjuk be
        if (profileDropdown && profileDropdown.player.uid === player.uid) {
            setProfileDropdown(null);
            return;
        }

        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 400;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Döntés: ha nincs elég hely lent ÉS több hely van fent
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
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
            {/* Header */}
            <div className="border-b border-emerald-700/50 backdrop-blur-sm bg-slate-900/80">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white">📜 Game History</h1>
                            <p className="text-emerald-300/70 mt-2">Your completed matches</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {games.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-emerald-600/30">
                        <div className="text-5xl mb-4">📜</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Completed Games</h3>
                        <p className="text-emerald-300/70 mb-6">Finish a game to see it here!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {games.map((game) => (
                            <div
                                key={game.id}
                                className="group bg-slate-800/60 hover:bg-slate-700/80 border border-emerald-600/30 hover:border-emerald-500 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                                onClick={() => openGame(game.id)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            className="w-10 h-10 rounded-full ring-2 ring-emerald-600/50"
                                            src="/LobbyIcon.png"
                                            alt="chess"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-emerald-300/70">Game</p>
                                            <p className="text-white font-mono text-sm">{game.id.slice(-6)}</p>
                                            {game.updatedAt && (
                                                <p className="text-emerald-300/50 text-xs mt-0.5">
                                                    🕒 {formatTimeAgo(game.updatedAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div 
                                        className={`bg-slate-900/50 border rounded p-3 hover:border-emerald-500/40 transition-colors cursor-pointer relative ${
                                            game.players?.white?.uid === currentUser?.uid
                                                ? game.winner === 'white'
                                                    ? 'border-green-500/60 bg-green-500/5 ring-2 ring-green-500/20'
                                                    : game.winner === 'black'
                                                    ? 'border-red-500/60 bg-red-500/5 ring-2 ring-red-500/20'
                                                    : 'border-amber-500/60 bg-amber-500/5 ring-2 ring-amber-500/20'
                                                : 'border-emerald-600/20'
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlayerClick(e, game.players?.white, game, "white");
                                        }}
                                    >
                                        {game.players?.white?.uid === currentUser?.uid && (
                                            <div className={`absolute -top-2 -right-2 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg ${
                                                game.winner === 'white' 
                                                    ? 'bg-green-500' 
                                                    : game.winner === 'black' 
                                                    ? 'bg-red-500' 
                                                    : 'bg-amber-500'
                                            }`}>
                                                {game.winner === 'white' ? '👑 WON' : game.winner === 'black' ? '💀 LOST' : game.winner === 'draw' ? '🤝 DRAW' : 'YOU'}
                                            </div>
                                        )}
                                        <p className="text-xs text-emerald-300/60 mb-1">White</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium">
                                                {game.players?.white
                                                    ? game.players.white.name || (game.players.white.uid ? "Guest" : "Waiting")
                                                    : "Waiting"}
                                            </p>
                                            {game.players?.white && (
                                                isGuest(game.players.white) ? (
                                                    <span className="text-slate-400 text-xs bg-slate-700/50 px-2 py-0.5 rounded flex items-center gap-1">
                                                        🎮 Guest
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-400 font-semibold text-sm bg-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                                                        <span>{game.finalElo?.white || game.players.white.elo || 1200}</span>
                                                        {game.status === "ended" && game.finalElo?.white && game.startingElo?.white && (
                                                            <span className={`text-xs font-bold ${
                                                                (game.finalElo.white - game.startingElo.white) > 0 
                                                                    ? 'text-green-400' 
                                                                    : 'text-red-400'
                                                            }`}>
                                                                ({(game.finalElo.white - game.startingElo.white) > 0 ? '+' : ''}
                                                                {game.finalElo.white - game.startingElo.white})
                                                            </span>
                                                        )}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center text-emerald-600/40">
                                        <div className="h-px flex-1 bg-emerald-600/20"></div>
                                        <span className="px-2 text-xs">vs</span>
                                        <div className="h-px flex-1 bg-emerald-600/20"></div>
                                    </div>

                                    <div 
                                        className={`bg-slate-900/50 border rounded p-3 hover:border-emerald-500/40 transition-colors cursor-pointer relative ${
                                            game.players?.black?.uid === currentUser?.uid
                                                ? game.winner === 'black'
                                                    ? 'border-green-500/60 bg-green-500/5 ring-2 ring-green-500/20'
                                                    : game.winner === 'white'
                                                    ? 'border-red-500/60 bg-red-500/5 ring-2 ring-red-500/20'
                                                    : 'border-amber-500/60 bg-amber-500/5 ring-2 ring-amber-500/20'
                                                : 'border-emerald-600/20'
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlayerClick(e, game.players?.black, game, "black");
                                        }}
                                    >
                                        {game.players?.black?.uid === currentUser?.uid && (
                                            <div className={`absolute -top-2 -right-2 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg ${
                                                game.winner === 'black' 
                                                    ? 'bg-green-500' 
                                                    : game.winner === 'white' 
                                                    ? 'bg-red-500' 
                                                    : 'bg-amber-500'
                                            }`}>
                                                {game.winner === 'black' ? '👑 WON' : game.winner === 'white' ? '💀 LOST' : game.winner === 'draw' ? '🤝 DRAW' : 'YOU'}
                                            </div>
                                        )}
                                        <p className="text-xs text-emerald-300/60 mb-1">Black</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium">
                                                {game.players?.black
                                                    ? game.players.black.name || (game.players.black.uid ? "Guest" : "Waiting")
                                                    : "Waiting"}
                                            </p>
                                            {game.players?.black && (
                                                isGuest(game.players.black) ? (
                                                    <span className="text-slate-400 text-xs bg-slate-700/50 px-2 py-0.5 rounded flex items-center gap-1">
                                                        🎮 Guest
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-400 font-semibold text-sm bg-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                                                        <span>{game.finalElo?.black || game.players.black.elo || 1200}</span>
                                                        {game.status === "ended" && game.finalElo?.black && game.startingElo?.black && (
                                                            <span className={`text-xs font-bold ${
                                                                (game.finalElo.black - game.startingElo.black) > 0 
                                                                    ? 'text-green-400' 
                                                                    : 'text-red-400'
                                                            }`}>
                                                                ({(game.finalElo.black - game.startingElo.black) > 0 ? '+' : ''}
                                                                {game.finalElo.black - game.startingElo.black})
                                                            </span>
                                                        )}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                {profileDropdown.player.name || "Guest"}
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
