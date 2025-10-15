import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
    const [games, setGames] = useState<any[]>([]);
    const [profileDropdown, setProfileDropdown] = useState<{
        player: any;
        position: { top: number; left: number };
    } | null>(null);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Helper: generate random ELO between 800-2800
    const getRandomELO = () => Math.floor(Math.random() * 2000) + 800;

    // Helper: check if game is full
    const isFull = (game: any) => game.players?.white && game.players?.black;

    // Helper: get button label
    const getButtonLabel = (game: any) => {
        return isFull(game) ? "👁 Spectate" : "➕ Join";
    };

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
            default:
                return "bg-red-100 text-red-700";
        }
    };

    // Helper: get status label
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "waiting":
                return "⏳ Waiting";
            case "ongoing":
                return "▶ Ongoing";
            default:
                return "✔ Ended";
        }
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
        const gamesRef = ref(db, "games");
        const unsub = onValue(gamesRef, (snap) => {
            const val = snap.val() || {};
            const list = Object.entries(val).map(([id, g]: any) => {
                // Add random ELO if not present
                const enrichedGame = {
                    id,
                    ...g,
                };
                if (enrichedGame.players?.white && !enrichedGame.players.white.elo) {
                    enrichedGame.players.white.elo = getRandomELO();
                }
                if (enrichedGame.players?.black && !enrichedGame.players.black.elo) {
                    enrichedGame.players.black.elo = getRandomELO();
                }
                return enrichedGame;
            });
            setGames(list);
            console.log("Fetched games:", list);
        });
        return () => unsub();
    }, []);

    async function createGame() {
        const newGameId = Date.now().toString();
        navigate(`/game/${newGameId}`);
    }

    function joinGame(gameId: string) {
        navigate(`/game/${gameId}`);
    }

    function handlePlayerClick(event: React.MouseEvent, player: any) {
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
        setProfileDropdown({
            player,
            position: {
                top: rect.bottom + 8,
                left: rect.left,
            },
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
                            <p className="text-emerald-300/70 mt-2">Find and join games</p>
                        </div>
                        <button
                            onClick={createGame}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 cursor-pointer transition-all shadow-lg hover:shadow-emerald-500/50"
                        >
                            + Create Game
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {games.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-emerald-600/30">
                        <div className="text-5xl mb-4">♟️</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Active Games</h3>
                        <p className="text-emerald-300/70 mb-6">Be the first to create a game!</p>
                        <button
                            onClick={createGame}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all cursor-pointer"
                        >
                            + Create Game
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
                                            src="/LobbyIcon2.png"
                                            alt="chess"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-emerald-300/70">Game</p>
                                            <p className="text-white font-mono text-sm">{game.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(game.status)}`}>
                                        {getStatusLabel(game.status)}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div 
                                        className="bg-slate-900/50 border border-emerald-600/20 rounded p-3 hover:border-emerald-500/40 transition-colors cursor-pointer"
                                        onClick={(e) => handlePlayerClick(e, game.players?.white)}
                                    >
                                        <p className="text-xs text-emerald-300/60 mb-1">White</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium">
                                                {game.players?.white
                                                    ? game.players.white.name || (game.players.white.uid ? "Guest" : "Waiting")
                                                    : "Waiting"}
                                            </p>
                                            {game.players?.white?.elo && (
                                                <span className="text-emerald-400 font-semibold text-sm bg-emerald-500/20 px-2 py-0.5 rounded">
                                                    {game.players.white.elo}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center text-emerald-600/40">
                                        <div className="h-px flex-1 bg-emerald-600/20"></div>
                                        <span className="px-2 text-xs">vs</span>
                                        <div className="h-px flex-1 bg-emerald-600/20"></div>
                                    </div>

                                    <div 
                                        className="bg-slate-900/50 border border-emerald-600/20 rounded p-3 hover:border-emerald-500/40 transition-colors cursor-pointer"
                                        onClick={(e) => handlePlayerClick(e, game.players?.black)}
                                    >
                                        <p className="text-xs text-emerald-300/60 mb-1">Black</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium">
                                                {game.players?.black
                                                    ? game.players.black.name || (game.players.black.uid ? "Guest" : "Waiting")
                                                    : "Waiting"}
                                            </p>
                                            {game.players?.black?.elo && (
                                                <span className="text-emerald-400 font-semibold text-sm bg-emerald-500/20 px-2 py-0.5 rounded">
                                                    {game.players.black.elo}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => joinGame(game.id)}
                                    className={`w-full mt-4 py-2.5 font-medium rounded transition-all border cursor-pointer ${getButtonClass(game)}`}
                                >
                                    {getButtonLabel(game)}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Profile Dropdown */}
            {profileDropdown && (
                <div
                    ref={dropdownRef}
                    className="fixed z-50 bg-slate-800 border border-emerald-600/50 rounded-lg shadow-xl shadow-emerald-500/20 p-4 min-w-[280px]"
                    style={{
                        top: `${profileDropdown.position.top}px`,
                        left: `${profileDropdown.position.left}px`,
                    }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center text-2xl">
                            👤
                        </div>
                        <div>
                            <p className="text-white font-semibold">
                                {profileDropdown.player.name || "Guest"}
                            </p>
                            {profileDropdown.player.elo && (
                                <p className="text-emerald-400 text-sm font-medium">
                                    ELO: {profileDropdown.player.elo}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="border-t border-emerald-600/30 pt-3 space-y-2">
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
        </div>
    );
}