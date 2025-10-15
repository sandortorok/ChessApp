import type { MoveHistoryType } from "../types";


interface Props {
    moveHistory: MoveHistoryType[];
    viewingHistoryIndex: number | null;
    onViewMove: (index: number) => void;
    onGoToLatest?: () => void;
}

export default function MoveHistory({
    moveHistory,
    viewingHistoryIndex,
    onViewMove,
    onGoToLatest
}: Props) {
    // Lépések párokba rendezése (fehér-fekete)
    const movePairs: Array<{ white?: MoveHistoryType; black?: MoveHistoryType; moveNumber: number }> = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        const white = moveHistory[i];
        const black = moveHistory[i + 1];
        movePairs.push({
            white,
            black,
            moveNumber: Math.floor(i / 2) + 1,
        });
    }

    return (
        <div className="w-full lg:w-80 bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
            {/* Fejléc */}
            <div className="bg-slate-700/50 border-b border-emerald-600/30 p-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">♟</span>
                        Lépések
                    </h2>
                    {viewingHistoryIndex !== null && onGoToLatest && (
                        <button
                            onClick={onGoToLatest}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 rounded-lg transition-all"
                        >
                            <span className="flex items-center gap-1">
                                🔄 Élő játék
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <div className="p-3">
                {moveHistory.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-3 opacity-20">♟</div>
                        <p className="text-slate-300 text-base">Még nincsenek lépések</p>
                        <p className="text-slate-400 text-xs mt-1">A játék itt fog megjelenni</p>
                    </div>
                ) : (
                    <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {movePairs.map((pair, pairIndex) => (
                            <div
                                key={pairIndex}
                                className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-1.5 transition-all border border-emerald-600/20 hover:border-emerald-500/40"
                            >
                                <span className="text-emerald-400 font-bold text-sm w-8 text-center bg-slate-800/50 rounded py-0.5 border border-emerald-600/30">
                                    {pair.moveNumber}
                                </span>

                                <div className="grid grid-cols-2 gap-1.5 flex-1">
                                    {pair.white && (
                                        <button
                                            onClick={() => onViewMove(pairIndex * 2)}
                                            className={`text-center px-2 py-2 rounded-lg font-mono font-semibold text-sm transition-all ${
                                                viewingHistoryIndex === pairIndex * 2
                                                    ? "bg-emerald-600/30 border-2 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10"
                                                    : "bg-slate-700/50 border border-emerald-600/20 text-slate-200 hover:bg-slate-700/70 hover:border-emerald-500/40"
                                            }`}
                                        >
                                            {pair.white.san}
                                        </button>
                                    )}

                                    {pair.black ? (
                                        <button
                                            onClick={() => onViewMove(pairIndex * 2 + 1)}
                                            className={`text-center px-2 py-2 rounded-lg font-mono font-semibold text-sm transition-all ${
                                                viewingHistoryIndex === pairIndex * 2 + 1
                                                    ? "bg-emerald-600/30 border-2 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10"
                                                    : "bg-slate-800/70 border border-emerald-600/20 text-slate-200 hover:bg-slate-800/90 hover:border-emerald-500/40"
                                            }`}
                                        >
                                            {pair.black.san}
                                        </button>
                                    ) : (
                                        <div className="bg-slate-800/30 border border-emerald-600/10 rounded-lg"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Navigációs gombok */}
                {moveHistory.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-emerald-600/30">
                        <button
                            onClick={() => onViewMove(0)}
                            disabled={viewingHistoryIndex === 0}
                            className="bg-slate-700/50 hover:bg-slate-700/70 disabled:bg-slate-800/30 disabled:text-slate-600 text-white px-2 py-2 rounded-lg font-bold transition-all border border-emerald-600/20 hover:border-emerald-500/40 disabled:border-emerald-600/10 text-sm"
                            title="Első lépés"
                        >
                            ⏮
                        </button>
                        <button
                            onClick={() =>
                                viewingHistoryIndex !== null && onViewMove(Math.max(0, viewingHistoryIndex - 1))
                            }
                            disabled={viewingHistoryIndex === null || viewingHistoryIndex === 0}
                            className="bg-slate-700/50 hover:bg-slate-700/70 disabled:bg-slate-800/30 disabled:text-slate-600 text-white px-2 py-2 rounded-lg font-bold transition-all border border-emerald-600/20 hover:border-emerald-500/40 disabled:border-emerald-600/10 text-sm"
                            title="Előző lépés"
                        >
                            ◀
                        </button>
                        <button
                            onClick={() =>
                                viewingHistoryIndex !== null &&
                                onViewMove(Math.min(moveHistory.length - 1, viewingHistoryIndex + 1))
                            }
                            disabled={viewingHistoryIndex === null || viewingHistoryIndex === moveHistory.length - 1}
                            className="bg-slate-700/50 hover:bg-slate-700/70 disabled:bg-slate-800/30 disabled:text-slate-600 text-white px-2 py-2 rounded-lg font-bold transition-all border border-emerald-600/20 hover:border-emerald-500/40 disabled:border-emerald-600/10 text-sm"
                            title="Következő lépés"
                        >
                            ▶
                        </button>
                        <button
                            onClick={() => onViewMove(moveHistory.length - 1)}
                            disabled={viewingHistoryIndex === moveHistory.length - 1}
                            className="bg-slate-700/50 hover:bg-slate-700/70 disabled:bg-slate-800/30 disabled:text-slate-600 text-white px-2 py-2 rounded-lg font-bold transition-all border border-emerald-600/20 hover:border-emerald-500/40 disabled:border-emerald-600/10 text-sm"
                            title="Utolsó lépés"
                        >
                            ⏭
                        </button>
                    </div>
                )}  
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(16, 185, 129, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.7);
                }
            `}</style>
        </div>
    );
}