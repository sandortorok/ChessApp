interface LeaderboardHeaderProps {
    playerCount: number;
}

export default function LeaderboardHeader({ playerCount }: LeaderboardHeaderProps) {
    return (
        <div className="border-b border-emerald-700/50 backdrop-blur-sm bg-slate-900/80">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">🏆 Leaderboard</h1>
                        <p className="text-emerald-300/70 mt-2">Top players by ELO rating</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-400">{playerCount}</p>
                        <p className="text-sm text-emerald-300/70">Total Players</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
