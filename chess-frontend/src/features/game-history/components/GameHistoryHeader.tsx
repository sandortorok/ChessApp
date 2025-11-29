interface GameHistoryHeaderProps {
    title?: string;
    description?: string;
}

export function GameHistoryHeader({ 
    title = "📜 Game History", 
    description = "Your completed matches" 
}: GameHistoryHeaderProps) {
    return (
        <div className="border-b border-emerald-700/50 backdrop-blur-sm bg-slate-900/80">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">{title}</h1>
                        <p className="text-emerald-300/70 mt-2">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
