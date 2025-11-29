import { SquarePlus, SquareMinus } from "lucide-react";
import { getEloColor, getEloRank } from "../utils/leaderboardHelpers";

interface Player {
    name?: string;
    elo: number;
    wins: number;
    losses: number;
}

interface PodiumCardProps {
    player: Player;
    rank: 1 | 2 | 3;
}

const MEDAL_CONFIGS = {
    1: {
        emoji: "🥇",
        size: "text-6xl",
        borderClass: "border-yellow-400/50",
        bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20",
        shadowClass: "shadow-2xl shadow-yellow-500/20",
        nameSize: "text-3xl",
        eloSize: "text-4xl",
        translateClass: "-translate-y-2",
        iconSize: 16,
        textSize: "text-sm",
    },
    2: {
        emoji: "🥈",
        size: "text-5xl",
        borderClass: "border-slate-400/50",
        bgClass: "bg-slate-800/60",
        shadowClass: "",
        nameSize: "text-2xl",
        eloSize: "text-3xl",
        translateClass: "translate-y-4",
        iconSize: 14,
        textSize: "text-xs",
    },
    3: {
        emoji: "🥉",
        size: "text-5xl",
        borderClass: "border-amber-700/50",
        bgClass: "bg-slate-800/60",
        shadowClass: "",
        nameSize: "text-2xl",
        eloSize: "text-3xl",
        translateClass: "translate-y-4",
        iconSize: 14,
        textSize: "text-xs",
    },
};

export default function PodiumCard({ player, rank }: PodiumCardProps) {
    const config = MEDAL_CONFIGS[rank];

    return (
        <div className={`${config.bgClass} border-2 ${config.borderClass} rounded-xl p-6 text-center transform ${config.translateClass} ${config.shadowClass}`}>
            <div className={`${config.size} mb-3`}>{config.emoji}</div>
            <div className={`${config.nameSize} font-bold text-white mb-1`}>{player.name}</div>
            <div className={`${config.eloSize} font-bold ${getEloColor(player.elo)} mb-2`}>
                {player.elo}
            </div>
            <div className="text-sm text-emerald-300/60">{getEloRank(player.elo)}</div>
            <div className={`mt-${rank === 1 ? '4' : '3'} flex justify-center gap-4 ${config.textSize} text-slate-300`}>
                <span className="flex items-center gap-1">
                    <SquarePlus size={config.iconSize} className="text-green-500" />
                    <span className="text-green-400">{player.wins}W</span>
                </span>
                <span className="flex items-center gap-1">
                    <SquareMinus size={config.iconSize} className="text-red-500" />
                    <span className="text-red-400">{player.losses}L</span>
                </span>
            </div>
        </div>
    );
}
