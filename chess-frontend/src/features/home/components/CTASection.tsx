interface CTASectionProps {
    user: unknown;
    onNavigate: () => void;
}

function CTASection({ user, onNavigate }: CTASectionProps) {
    return (
        <div className="relative z-10 py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="relative backdrop-blur-xl bg-slate-800/60 rounded-3xl p-12 border border-emerald-500/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-500/10" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
                    
                    <div className="relative text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Dominate the Board?
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of players in the ultimate chess experience. Create your account and start your journey to grandmaster today.
                        </p>
                        <button
                            onClick={onNavigate}
                            className="group relative px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white hover:text-gray-100 text-lg font-bold rounded-xl border border-emerald-600/30 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span className="relative flex items-center justify-center gap-2">
                                {user ? "Enter Arena" : "Join Now - It's Free"}
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CTASection;
