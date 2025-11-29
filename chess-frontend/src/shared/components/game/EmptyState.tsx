interface EmptyStateProps {
    title: string;
    description: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ title, description, icon = "♟️", actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-emerald-600/30">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-emerald-300/70 mb-6">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="group relative px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl border border-emerald-600/30 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        {actionLabel}
                    </span>
                </button>
            )}
        </div>
    );
}
