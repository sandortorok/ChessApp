import { PlayerSlot } from "./PlayerSlot";
import { formatTimeAgo, getStatusColor, getStatusLabel, isGameFull } from "@/shared/utils/gameHelpers";

export interface GameCardProps {
    game: any;
    currentUserId?: string;
    onPlayerClick?: (event: React.MouseEvent, player: any, game: any, playerColor: "white" | "black") => void;
    onCardClick?: (gameId: string) => void;
    showJoinButton?: boolean;
    showStatus?: boolean;
    showTimeControl?: boolean;
    showResult?: boolean;
}

export function GameCard({
    game,
    currentUserId,
    onPlayerClick,
    onCardClick,
    showJoinButton = false,
    showStatus = false,
    showTimeControl = false,
    showResult = false,
}: GameCardProps) {
    const isFull = isGameFull(game);

    const getJoinButtonClass = () => {
        return isFull
            ? "bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 border-blue-600/30 hover:border-blue-500/50"
            : "bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 border-emerald-600/30 hover:border-emerald-500/50";
    };

    const handleCardClick = () => {
        if (onCardClick && !showJoinButton) {
            onCardClick(game.id);
        }
    };

    return (
        <div
            className={`group bg-slate-800/60 hover:bg-slate-700/80 border border-emerald-600/30 hover:border-emerald-500 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 ${
                onCardClick && !showJoinButton ? "cursor-pointer" : ""
            }`}
            onClick={handleCardClick}
        >
            {/* Header */}
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
                            {showTimeControl && game.timeControl !== undefined && game.increment !== undefined && (
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-600/30">
                                    ⏱ {game.timeControl}+{game.increment}
                                </span>
                            )}
                        </div>
                        <p className="text-white font-mono text-sm">{game.id.slice(-6)}</p>
                        {(game.createdAt || game.updatedAt) && (
                            <p className="text-emerald-300/50 text-xs mt-0.5">
                                🕒 {formatTimeAgo(game.updatedAt || game.createdAt)}
                            </p>
                        )}
                    </div>
                </div>
                {showStatus && (
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(game.status)}`}>
                        {getStatusLabel(game.status)}
                    </span>
                )}
            </div>

            {/* Players */}
            <div className="space-y-3">
                <PlayerSlot
                    player={game.players?.white}
                    playerColor="white"
                    currentUserId={currentUserId}
                    gameData={game}
                    gameStatus={game.status}
                    showResult={showResult}
                    winner={game.winner}
                    winReason={game.winReason}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlayerClick?.(e, game.players?.white, game, "white");
                    }}
                />

                <div className="flex items-center justify-center text-emerald-600/40">
                    <div className="h-px flex-1 bg-emerald-600/20"></div>
                    <span className="px-2 text-xs">vs</span>
                    <div className="h-px flex-1 bg-emerald-600/20"></div>
                </div>

                <PlayerSlot
                    player={game.players?.black}
                    playerColor="black"
                    currentUserId={currentUserId}
                    gameData={game}
                    gameStatus={game.status}
                    showResult={showResult}
                    winner={game.winner}
                    winReason={game.winReason}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlayerClick?.(e, game.players?.black, game, "black");
                    }}
                />
            </div>

            {/* Join/Spectate Button */}
            {showJoinButton && onCardClick && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCardClick(game.id);
                    }}
                    className={`group/btn relative w-full mt-4 py-2.5 font-bold rounded-lg transition-all duration-300 border cursor-pointer transform hover:scale-[1.02] active:scale-95 overflow-hidden ${getJoinButtonClass()}`}
                >
                    <div
                        className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ${
                            isFull ? "via-blue-400/10" : "via-emerald-400/10"
                        }`}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                        {isFull ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                Spectate
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Join
                            </>
                        )}
                    </span>
                </button>
            )}
        </div>
    );
}
