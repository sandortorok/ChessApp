import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { SquarePlus, SquareMinus } from "lucide-react";

const DEFAULT_AVATAR = "emoji:👤";

interface Player {
    uid: string;
    name?: string;
    displayName?: string;
    email?: string;
    elo: number;
    wins: number;
    losses: number;
    draws?: number;
    photoURL?: string;
}

export default function Leaderboard() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const usersRef = collection(firestore, "users");
                const q = query(usersRef, orderBy("elo", "desc"), limit(100));
                const snapshot = await getDocs(q);

                const playersList: Player[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    
                    // Helper to get display name
                    const getDisplayName = () => {
                        if (data.displayName) return data.displayName;
                        if (data.name) return data.name;
                        if (data.email) return data.email;
                        console.log("No name or email for user:", doc.id);
                        // Check if guest
                        return `Guest ${doc.id.slice(1, 5)}`
                    };                    
                    playersList.push({
                        uid: doc.id,
                        name: getDisplayName(),
                        displayName: data.displayName,
                        email: data.email,
                        elo: data.elo || 1200,
                        wins: data.wins || 0,
                        losses: data.losses || 0,
                        draws: data.draws || 0,
                        photoURL: data.photoURL || DEFAULT_AVATAR,
                    });
                });

                setPlayers(playersList);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, []);

    const getRankMedal = (rank: number) => {
        switch (rank) {
            case 1:
                return "🥇";
            case 2:
                return "🥈";
            case 3:
                return "🥉";
            default:
                return `#${rank}`;
        }
    };

    const getEloColor = (elo: number) => {
        if (elo >= 2400) return "text-purple-400";
        if (elo >= 2200) return "text-red-400";
        if (elo >= 2000) return "text-orange-400";
        if (elo >= 1800) return "text-yellow-400";
        if (elo >= 1600) return "text-emerald-400";
        if (elo >= 1400) return "text-blue-400";
        return "text-slate-400";
    };

    const getEloRank = (elo: number) => {
        if (elo >= 2400) return "Grand Master";
        if (elo >= 2200) return "Master";
        if (elo >= 2000) return "Expert";
        if (elo >= 1800) return "Advanced";
        if (elo >= 1600) return "Intermediate";
        if (elo >= 1400) return "Beginner";
        return "Novice";
    };

    const renderAvatar = (photoURL?: string) => {
        if (!photoURL || photoURL === DEFAULT_AVATAR) {
            return <span className="text-2xl">👤</span>;
        }
        if (photoURL.startsWith('emoji:')) {
            return <span className="text-2xl">{photoURL.replace('emoji:', '')}</span>;
        }
        return <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
            {/* Header */}
            <div className="border-b border-emerald-700/50 backdrop-blur-sm bg-slate-900/80">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white">🏆 Leaderboard</h1>
                            <p className="text-emerald-300/70 mt-2">Top players by ELO rating</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-400">{players.length}</p>
                            <p className="text-sm text-emerald-300/70">Total Players</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                        <p className="text-emerald-300/70 mt-4">Loading leaderboard...</p>
                    </div>
                ) : players.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-emerald-600/30">
                        <div className="text-5xl mb-4">🏆</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Players Yet</h3>
                        <p className="text-emerald-300/70">Be the first to play and earn your spot!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Top 3 podium */}
                        {players.length >= 3 && (
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {/* 2nd place */}
                                <div className="bg-slate-800/60 border-2 border-slate-400/50 rounded-xl p-6 text-center transform translate-y-4">
                                    <div className="text-5xl mb-3">🥈</div>
                                    <div className="text-2xl font-bold text-white mb-1">{players[1].name}</div>
                                    <div className={`text-3xl font-bold ${getEloColor(players[1].elo)} mb-2`}>
                                        {players[1].elo}
                                    </div>
                                    <div className="text-sm text-emerald-300/60">{getEloRank(players[1].elo)}</div>
                                    <div className="mt-3 flex justify-center gap-4 text-xs text-slate-300">
                                        <span className="flex items-center gap-1">
                                            <SquarePlus size={14} className="text-green-500" />
                                            <span className="text-green-400">{players[1].wins}W</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <SquareMinus size={14} className="text-red-500" />
                                            <span className="text-red-400">{players[1].losses}L</span>
                                        </span>
                                    </div>
                                </div>

                                {/* 1st place */}
                                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-xl p-6 text-center transform -translate-y-2 shadow-2xl shadow-yellow-500/20">
                                    <div className="text-6xl mb-3">🥇</div>
                                    <div className="text-3xl font-bold text-white mb-1">{players[0].name}</div>
                                    <div className={`text-4xl font-bold ${getEloColor(players[0].elo)} mb-2`}>
                                        {players[0].elo}
                                    </div>
                                    <div className="text-sm text-emerald-300/60">{getEloRank(players[0].elo)}</div>
                                    <div className="mt-4 flex justify-center gap-4 text-sm text-slate-300">
                                        <span className="flex items-center gap-1">
                                            <SquarePlus size={16} className="text-green-500" />
                                            <span className="text-green-400">{players[0].wins}W</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <SquareMinus size={16} className="text-red-500" />
                                            <span className="text-red-400">{players[0].losses}L</span>
                                        </span>
                                    </div>
                                </div>

                                {/* 3rd place */}
                                <div className="bg-slate-800/60 border-2 border-amber-700/50 rounded-xl p-6 text-center transform translate-y-4">
                                    <div className="text-5xl mb-3">🥉</div>
                                    <div className="text-2xl font-bold text-white mb-1">{players[2].name}</div>
                                    <div className={`text-3xl font-bold ${getEloColor(players[2].elo)} mb-2`}>
                                        {players[2].elo}
                                    </div>
                                    <div className="text-sm text-emerald-300/60">{getEloRank(players[2].elo)}</div>
                                    <div className="mt-3 flex justify-center gap-4 text-xs text-slate-300">
                                        <span className="flex items-center gap-1">
                                            <SquarePlus size={14} className="text-green-500" />
                                            <span className="text-green-400">{players[2].wins}W</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <SquareMinus size={14} className="text-red-500" />
                                            <span className="text-red-400">{players[2].losses}L</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rest of the leaderboard */}
                        <div className="bg-slate-800/50 rounded-xl border border-emerald-600/30 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-900/50 border-b border-emerald-600/30">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-300/70">Rank</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-300/70">Player</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-300/70">ELO</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-300/70">Rank</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-300/70">Wins</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-300/70">Losses</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-300/70">Win Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-600/20">
                                        {players.map((player, index) => {
                                            const totalGames = player.wins + player.losses;
                                            const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : "0.0";

                                            return (
                                                <tr
                                                    key={player.uid}
                                                    className="hover:bg-slate-700/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="text-lg font-bold text-white">
                                                            {getRankMedal(index + 1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center overflow-hidden border border-emerald-600/30">
                                                                {renderAvatar(player.photoURL)}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{player.name}</p>
                                                                {player.email && (
                                                                    <p className="text-xs text-slate-400">{player.email}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-2xl font-bold ${getEloColor(player.elo)}`}>
                                                            {player.elo}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm text-emerald-300/70">
                                                            {getEloRank(player.elo)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-emerald-400 font-semibold">
                                                            {player.wins}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-red-400 font-semibold">
                                                            {player.losses}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-white font-semibold">
                                                            {winRate}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
