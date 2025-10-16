import { X, Trophy, Clock, Users, XCircle } from "lucide-react";
import type { Player, winReason } from "../types";

interface GameEndModalProps {
    isOpen: boolean;
    winner: "white" | "black" | "draw" | null;
    winReason?: winReason;
    players: {
        white: Player | null;
        black: Player | null;
    } | null;
    currentUser: any;
    startingElo?: { white: number; black: number } | null;
    finalElo?: { white: number; black: number } | null;
    eloChanges?: { whiteChange: number; blackChange: number } | null;
    onClose: () => void;
    onNewGame?: () => void;
    onRematch?: () => void;
}

export default function GameEndModal({
    isOpen,
    winner,
    winReason = "checkmate",
    players,
    currentUser,
    startingElo,
    finalElo,
    eloChanges,
    onClose,
    onNewGame,
    onRematch,
}: GameEndModalProps) {
    if (!isOpen) return null;

    const getWinnerName = () => {
        if (winner === "draw") return "Draw";
        if (!players) return "";
        const winnerPlayer = winner === "white" ? players.white : players.black;
        // @ts-ignore - 'name' property exists in database but not in type
        return winnerPlayer?.displayName || winnerPlayer?.name || "Unknown";
    };

    const getWinReasonText = () => {
        switch (winReason) {
            case "checkmate":
                return "Checkmate";
            case "timeout":
                return "Time Out";
            case "resignation":
                return "Resignation";
            case "aggreement":
                return "Agreement";
            case "stalemate":
                return "Stalemate";
            case "threefoldRepetition":
                return "Threefold Repetition";
            case "insufficientMaterial":
                return "Insufficient Material";
            case "draw":
                return "Draw";
            case "aborted":
                return "Game Aborted";
            default:
                return "";
        }
    };

    const isWinner = () => {
        if (winner === "draw") return false;
        if (!currentUser || !players) return false;
        const mySide = players.white?.uid === currentUser.uid ? "white" : "black";
        return mySide === winner;
    };

    const isSpectator = () => {
        if (!currentUser || !players) return true;
        return players.white?.uid !== currentUser.uid && players.black?.uid !== currentUser.uid;
    };

    const getResultMessage = () => {
        if (winner === "draw") {
            // Ha aborted, speciális üzenet
            if (winReason === "aborted") {
                return "Game Aborted";
            }
            return "The game ended in a draw";
        }

        if (isSpectator()) {
            return winner === "white" ? "White won!" : "Black won!";
        }

        return isWinner() ? "Congratulations, you won! 🎉" : "You lost this time";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-slate-800 rounded-lg shadow-2xl max-w-md w-full border border-emerald-600/30 overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-900 border-b border-emerald-600/20">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-emerald-300/70 hover:text-emerald-300 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-white">Game Over</h2>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Trophy/Icon Section */}
                    <div className="flex justify-center">
                        <div className={`p-4 rounded-full ${
                            winner === "draw" 
                                ? winReason === "aborted"
                                    ? "bg-orange-600/20 border border-orange-600/30"
                                    : "bg-emerald-600/20 border border-emerald-600/30"
                                : isWinner() 
                                    ? "bg-emerald-600/20 border border-emerald-600/30" 
                                    : "bg-red-500/20 border border-red-500/30"
                        }`}>
                            {winner === "draw" ? (
                                winReason === "aborted" ? (
                                    <XCircle size={48} className="text-orange-400" />
                                ) : (
                                    <Users size={48} className="text-emerald-400" />
                                )
                            ) : (
                                <Trophy
                                    size={48}
                                    className={isWinner() ? "text-emerald-400" : "text-red-400"}
                                />
                            )}
                        </div>
                    </div>

                    {/* Result message */}
                    <p className={`text-center text-lg font-medium ${
                        winner === "draw" 
                            ? winReason === "aborted"
                                ? "text-orange-300"
                                : "text-emerald-300/70"
                            : isWinner() 
                                ? "text-emerald-400" 
                                : "text-red-400"
                    }`}>
                        {getResultMessage()}
                    </p>

                    {/* Winner info */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-emerald-600/20 space-y-3">
                        {winner !== "draw" && (
                            <div className="flex items-center justify-between pb-3 border-b border-emerald-600/20">
                                <span className="text-sm font-medium text-emerald-300">Winner:</span>
                                <span className="text-white font-semibold">
                                    {getWinnerName()}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-emerald-300">Reason:</span>
                            <div className="flex items-center gap-2">
                                {winReason === "timeout" && <Clock size={16} className="text-emerald-300/70" />}
                                <span className="text-white font-medium">
                                    {getWinReasonText()}
                                </span>
                            </div>
                        </div>

                        {/* Aborted game message */}
                        {winReason === "aborted" && (
                            <div className="pt-3 border-t border-orange-600/20">
                                <div className="text-sm text-orange-300 text-center italic">
                                    ⚠️ A játék túl korán lett megszakítva. Nincs ELO változás.
                                </div>
                            </div>
                        )}

                        {/* ELO Changes */}
                        {winReason !== "aborted" && (eloChanges || (startingElo && finalElo)) && (
                            <div className="pt-3 border-t border-emerald-600/20">
                                <div className="text-sm font-medium text-emerald-300 mb-2">ELO Changes:</div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300 text-sm">
                                            {/* @ts-ignore - 'name' property exists in database but not in type */}
                                            {players?.white?.displayName || players?.white?.name || "White"}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {startingElo?.white && (
                                                <span className="text-slate-400 text-xs">
                                                    {startingElo.white}
                                                </span>
                                            )}
                                            {finalElo?.white && startingElo?.white && (
                                                <>
                                                    <span className="text-slate-500">→</span>
                                                    <span className="text-white font-semibold">
                                                        {finalElo.white}
                                                    </span>
                                                </>
                                            )}
                                            <span className={`font-bold ${
                                                (eloChanges?.whiteChange ?? (finalElo?.white && startingElo?.white ? finalElo.white - startingElo.white : 0)) >= 0 
                                                    ? "text-emerald-400" 
                                                    : "text-red-400"
                                            }`}>
                                                {((eloChanges?.whiteChange ?? (finalElo?.white && startingElo?.white ? finalElo.white - startingElo.white : 0)) >= 0 ? "+" : "")}
                                                {eloChanges?.whiteChange ?? (finalElo?.white && startingElo?.white ? finalElo.white - startingElo.white : 0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300 text-sm">
                                            {/* @ts-ignore - 'name' property exists in database but not in type */}
                                            {players?.black?.displayName || players?.black?.name || "Black"}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {startingElo?.black && (
                                                <span className="text-slate-400 text-xs">
                                                    {startingElo.black}
                                                </span>
                                            )}
                                            {finalElo?.black && startingElo?.black && (
                                                <>
                                                    <span className="text-slate-500">→</span>
                                                    <span className="text-white font-semibold">
                                                        {finalElo.black}
                                                    </span>
                                                </>
                                            )}
                                            <span className={`font-bold ${
                                                (eloChanges?.blackChange ?? (finalElo?.black && startingElo?.black ? finalElo.black - startingElo.black : 0)) >= 0 
                                                    ? "text-emerald-400" 
                                                    : "text-red-400"
                                            }`}>
                                                {((eloChanges?.blackChange ?? (finalElo?.black && startingElo?.black ? finalElo.black - startingElo.black : 0)) >= 0 ? "+" : "")}
                                                {eloChanges?.blackChange ?? (finalElo?.black && startingElo?.black ? finalElo.black - startingElo.black : 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={onRematch}
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all"
                        >
                            Rematch
                        </button>
                        <button
                            onClick={onNewGame}
                            className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all"
                        >
                            New Game
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-medium rounded-lg border border-slate-600/30 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}