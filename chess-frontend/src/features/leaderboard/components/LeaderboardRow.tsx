import PlayerAvatar from "./PlayerAvatar";
import { getRankMedal, getEloColor, getEloRank, calculateWinRate } from "../utils/leaderboardHelpers";

interface Player {
    uid: string;
    name?: string;
    email?: string;
    elo: number;
    wins: number;
    losses: number;
    photoURL?: string;
}

interface LeaderboardRowProps {
    player: Player;
    rank: number;
}

export default function LeaderboardRow({ player, rank }: LeaderboardRowProps) {
    const winRate = calculateWinRate(player.wins, player.losses);

    return (
        <tr className="hover:bg-slate-700/30 transition-colors">
            <td className="px-6 py-4">
                <span className="text-lg font-bold text-white">
                    {getRankMedal(rank)}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <PlayerAvatar photoURL={player.photoURL} size="sm" />
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
}
