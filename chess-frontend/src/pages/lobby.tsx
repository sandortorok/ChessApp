import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db, auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import PlayerProfileModal from "../components/PlayerProfileModal";
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

    // Helper: check if player is guest (uid starts with "guest_")
    const isGuest = (player: any) => {
        return player?.uid?.startsWith("guest_");
    };

    // Helper: check if game is full
    const isFull = (game: any) => game.players?.white && game.players?.black;

    // Helper: get button color based on full/not full
    const getButtonClass = (game: any) => {
        return isFull(game)
            ? "bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 border-blue-600/30 hover:border-blue-500/50"
            : "bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 border-emerald-600/30 hover:border-emerald-500/50";
    };

    // Helper: get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "waiting":
                return "bg-amber-100 text-amber-700";
            case "ongoing":
                return "bg-emerald-100 text-emerald-700";
            case "ended":
                return "bg-red-100 text-red-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    // Helper: get status label
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "waiting":
                return "⏳ Waiting";
            case "ongoing":
                return "▶ Ongoing";
            case "ended":
                return "✔ Ended";
            default:
                return "❓ Unknown";
        }
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

    function handleCreateGame(settings: GameSettings) {
        const newGameId = Date.now().toString();
        // Itt továbbíthatod a settings-et a játék oldalra
        // Egyelőre csak navigálunk a játékhoz
        console.log("Creating game with settings:", settings);
        navigate(`/game/${newGameId}`, { state: { gameSettings: settings } });
    }

    function joinGame(gameId: string) {
        if (!currentUser) {
            navigate("/login");
            return;
        }
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
        const dropdownHeight = 250;
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
                            <h1 className="text-4xl font-bold text-white">♟️ Lobby</h1>
                            <p className="text-emerald-300/70 mt-2">Find and join active games</p>
                        </div>
                        <button
                            onClick={() => {
                                if (!currentUser) {
                                    navigate("/login");
                                    return;
                                }
                                setShowCreateGameModal(true);
                            }}
                            className="group relative px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl border border-emerald-600/30 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm"
                        >
                            {/* Animated background shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            
                            <span className="relative flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Game
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                        <p className="text-emerald-300/70 mt-4">Loading games...</p>
                    </div>
                ) : games.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-emerald-600/30">
                        <div className="text-5xl mb-4">♟️</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Active Games</h3>
                        <p className="text-emerald-300/70 mb-6">Be the first to create a game!</p>
                        <button
                            onClick={() => {
                                if (!currentUser) {
                                    navigate("/login");
                                    return;
                                }
                                setShowCreateGameModal(true);
                            }}
                            className="group relative px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl border border-emerald-600/30 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm"
                        >
                            {/* Animated background shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            
                            <span className="relative flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Game
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {games.map((game) => (
                            <div
                                key={game.id}
                                className="group bg-slate-800/60 hover:bg-slate-700/80 border border-emerald-600/30 hover:border-emerald-500 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            className="w-10 h-10 rounded-full ring-2 ring-emerald-600/50"
                                            src="/LobbyIcon.png"
                                            alt="chess"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-emerald-300/70">Game</p>
                                                {game.timeControl !== undefined && game.increment !== undefined && (
                                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-600/30">
                                                        ⏱ {game.timeControl}+{game.increment}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white font-mono text-sm">{game.id.slice(-6)}</p>
                                            {game.createdAt && (
                                                <p className="text-emerald-300/50 text-xs mt-0.5">
                                                    🕒 {formatTimeAgo(game.createdAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(game.status)}`}>
                                        {getStatusLabel(game.status)}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div 
                                        className={`bg-slate-900/50 border rounded p-3 hover:border-emerald-500/40 transition-colors cursor-pointer relative ${
                                            game.players?.white?.uid === currentUser?.uid
                                                ? 'border-amber-500/60 bg-amber-500/5 ring-2 ring-amber-500/20'
                                                : 'border-emerald-600/20'
                                        }`}
                                        onClick={(e) => handlePlayerClick(e, game.players?.white, game, "white")}
                                    >
                                        {game.players?.white?.uid === currentUser?.uid && (
                                            <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                                                YOU
                                            </div>
                                        )}
                                        <p className="text-xs text-emerald-300/60 mb-1">White</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium">
                                                {game.players?.white
                                                    ? game.players.white.name || game.players.white.displayName || game.players.white.email?.split('@')[0] || (game.players.white.uid ? "Guest" : "Waiting")
                                                    : "Waiting"}
                                            </p>
                                            {game.players?.white && (
                                                isGuest(game.players.white) ? (
                                                    <span className="text-slate-400 text-xs bg-slate-700/50 px-2 py-0.5 rounded flex items-center gap-1">
                                                        🎮 Guest
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-emerald-400 font-semibold text-sm bg-emerald-500/20 px-2 py-0.5 rounded">
                                                            {game.finalElo?.white || game.startingElo?.white || game.players.white.elo || 1200}
                                                        </span>
                                                        {game.status === "ended" && game.finalElo?.white && game.startingElo?.white && (
                                                            <span className={`text-xs font-bold ${
                                                                (game.finalElo.white - game.startingElo.white) > 0 
                                                                    ? 'text-green-400' 
                                                                    : 'text-red-400'
                                                            }`}>
                                                                {(game.finalElo.white - game.startingElo.white) > 0 ? '+' : ''}
                                                                {game.finalElo.white - game.startingElo.white}
                                                            </span>
                                                        )}
                                                    </div>
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
                                                ? 'border-amber-500/60 bg-amber-500/5 ring-2 ring-amber-500/20'
                                                : 'border-emerald-600/20'
                                        }`}
                                        onClick={(e) => handlePlayerClick(e, game.players?.black, game, "black")}
                                    >
                                        {game.players?.black?.uid === currentUser?.uid && (
                                            <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                                                YOU
                                            </div>
                                        )}
                                        <p className="text-xs text-emerald-300/60 mb-1">Black</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium">
                                                {game.players?.black
                                                    ? game.players.black.name || game.players.black.displayName || game.players.black.email?.split('@')[0] || (game.players.black.uid ? "Guest" : "Waiting")
                                                    : "Waiting"}
                                            </p>
                                            {game.players?.black && (
                                                isGuest(game.players.black) ? (
                                                    <span className="text-slate-400 text-xs bg-slate-700/50 px-2 py-0.5 rounded flex items-center gap-1">
                                                        🎮 Guest
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-emerald-400 font-semibold text-sm bg-emerald-500/20 px-2 py-0.5 rounded">
                                                            {game.finalElo?.black || game.startingElo?.black || game.players.black.elo || 1200}
                                                        </span>
                                                        {game.status === "ended" && game.finalElo?.black && game.startingElo?.black && (
                                                            <span className={`text-xs font-bold ${
                                                                (game.finalElo.black - game.startingElo.black) > 0 
                                                                    ? 'text-green-400' 
                                                                    : 'text-red-400'
                                                            }`}>
                                                                {(game.finalElo.black - game.startingElo.black) > 0 ? '+' : ''}
                                                                {game.finalElo.black - game.startingElo.black}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => joinGame(game.id)}
                                    className={`group relative w-full mt-4 py-2.5 font-bold rounded-lg transition-all duration-300 border cursor-pointer transform hover:scale-[1.02] active:scale-95 overflow-hidden ${getButtonClass(game)}`}
                                >
                                    {/* Animated background shine */}
                                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ${
                                        isFull(game) ? 'via-blue-400/10' : 'via-emerald-400/10'
                                    }`} />
                                    
                                    <span className="relative flex items-center justify-center gap-2">
                                        {isFull(game) ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Spectate
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Join
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
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

            {/* Create Game Modal */}
            <CreateGameModal
                isOpen={showCreateGameModal}
                onClose={() => setShowCreateGameModal(false)}
                onCreate={handleCreateGame}
            />
        </div>
    );
}