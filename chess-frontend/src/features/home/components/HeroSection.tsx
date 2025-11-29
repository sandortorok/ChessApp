interface HeroSectionProps {
    user: any;
    onCreateGame: () => void;
    onBrowseLobbies: () => void;
}

export function HeroSection({ user, onCreateGame, onBrowseLobbies }: HeroSectionProps) {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
            <div className="max-w-5xl mx-auto text-center">
                {/* Main heading */}
                <div className="mb-8">
                    <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6">
                        <span className="inline-block bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text animate-gradient">
                            Chess Arena
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Master the ancient game in a modern battlefield. Challenge players worldwide in real-time matches.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <button
                        onClick={onCreateGame}
                        className="group relative px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-lg font-bold rounded-xl border-2 border-teal-400/50 hover:border-teal-300/70 cursor-pointer transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-400/50 transform hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm min-w-[200px]"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative flex items-center justify-center gap-2">
                            {user ? "Start Playing" : "Get Started"}
                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </button>

                    <button
                        onClick={onBrowseLobbies}
                        className="group relative px-8 py-4 bg-slate-800/60 hover:bg-slate-700/60 text-lg font-semibold text-white hover:text-gray-100 overflow-hidden rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 min-w-[200px] cursor-pointer"
                    >
                        <span className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300" />
                        <span className="relative">Browse Lobbies</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
