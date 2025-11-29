interface LobbyHeaderProps {
    onCreateGame: () => void;
}

export function LobbyHeader({ onCreateGame }: LobbyHeaderProps) {
    return (
        <div className="border-b border-emerald-700/50 backdrop-blur-sm bg-slate-900/80">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">♟️ Lobby</h1>
                        <p className="text-emerald-300/70 mt-2">Find and join active games</p>
                    </div>
                    <button
                        onClick={onCreateGame}
                        className="group relative px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl border border-emerald-600/30 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Game
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
