import LeaderboardRow from "./LeaderboardRow";

interface Player {
    uid: string;
    name?: string;
    email?: string;
    elo: number;
    wins: number;
    losses: number;
    photoURL?: string;
}

interface LeaderboardTableProps {
    players: Player[];
}

export default function LeaderboardTable({ players }: LeaderboardTableProps) {
    return (
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
                        {players.map((player, index) => (
                            <LeaderboardRow
                                key={player.uid}
                                player={player}
                                rank={index + 1}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
