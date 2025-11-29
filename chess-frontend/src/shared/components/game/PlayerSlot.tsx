import { isGuest, getPlayerDisplayName, getPlayerElo, getEloChange } from "@/shared/utils/gameHelpers";

export interface PlayerSlotProps {
    player: any;
    playerColor: "white" | "black";
    currentUserId?: string;
    gameData?: any;
    gameStatus?: string;
    onClick?: (event: React.MouseEvent) => void;
    showResult?: boolean;
    winner?: "white" | "black" | "draw";
    winReason?: string;
}

export function PlayerSlot({
    player,
    playerColor,
    currentUserId,
    gameData,
    gameStatus,
    onClick,
    showResult = false,
    winner,
    winReason,
}: PlayerSlotProps) {
    const isCurrentUser = player?.uid === currentUserId;
    const playerWon = winner === playerColor;
    const playerLost = winner && winner !== "draw" && winner !== playerColor;
    const isDraw = winner === "draw";
    const isAborted = isDraw && winReason === "aborted";

    const getBorderColor = () => {
        if (!isCurrentUser) return "border-emerald-600/20";
        if (!showResult) return "border-amber-500/60 bg-amber-500/5 ring-2 ring-amber-500/20";
        if (playerWon) return "border-green-500/60 bg-green-500/5 ring-2 ring-green-500/20";
        if (playerLost) return "border-red-500/60 bg-red-500/5 ring-2 ring-red-500/20";
        if (isAborted) return "border-orange-500/60 bg-orange-500/5 ring-2 ring-orange-500/20";
        return "border-amber-500/60 bg-amber-500/5 ring-2 ring-amber-500/20";
    };

    const getBadgeColor = () => {
        if (!showResult) return "bg-amber-500";
        if (playerWon) return "bg-green-500";
        if (playerLost) return "bg-red-500";
        if (isAborted) return "bg-orange-500";
        return "bg-amber-500";
    };

    const getBadgeLabel = () => {
        if (!showResult) return "YOU";
        if (playerWon) return "👑 WON";
        if (playerLost) return "💀 LOST";
        if (isAborted) return "⛔ ABORTED";
        if (isDraw) return "🤝 DRAW";
        return "YOU";
    };

    const eloChange = gameData && getEloChange(gameData, playerColor);
    const displayElo = getPlayerElo(player, gameData, playerColor);

    return (
        <div
            className={`bg-slate-900/50 border rounded p-3 hover:border-emerald-500/40 transition-colors cursor-pointer relative ${getBorderColor()}`}
            onClick={onClick}
        >
            {isCurrentUser && (
                <div className={`absolute -top-2 -right-2 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg ${getBadgeColor()}`}>
                    {getBadgeLabel()}
                </div>
            )}
            <p className="text-xs text-emerald-300/60 mb-1">
                {playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}
            </p>
            <div className="flex items-center justify-between">
                <p className="text-white font-medium">
                    {getPlayerDisplayName(player)}
                </p>
                {player && (
                    isGuest(player) ? (
                        <span className="text-slate-400 text-xs bg-slate-700/50 px-2 py-0.5 rounded flex items-center gap-1">
                            🎮 Guest
                        </span>
                    ) : (
                        <span className="text-emerald-400 font-semibold text-sm bg-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                            <span>{displayElo}</span>
                            {gameStatus === "ended" && winReason !== "aborted" && eloChange !== null && (
                                <span className={`text-xs font-bold ${eloChange > 0 ? "text-green-400" : "text-red-400"}`}>
                                    ({eloChange > 0 ? "+" : ""}{eloChange})
                                </span>
                            )}
                        </span>
                    )
                )}
            </div>
        </div>
    );
}
