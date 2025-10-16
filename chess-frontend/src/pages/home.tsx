import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Zap, Trophy, Users, BarChart3, Crown } from "lucide-react";

function Home() {
    const user = useAuth();
    const navigate = useNavigate();

    const createNewGame = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        const newGameId = Date.now().toString();
        navigate(`/game/${newGameId}`);
    };

    const features = [
        {
            icon: Zap,
            title: "Real-time Play",
            description: "Experience instant moves with our blazing-fast game engine"
        },
        {
            icon: Trophy,
            title: "Competitive Ranking",
            description: "Climb the leaderboard and prove your chess mastery"
        },
        {
            icon: Users,
            title: "Multiplayer Lobbies",
            description: "Join or create custom games with players worldwide"
        },
        {
            icon: BarChart3,
            title: "Track Progress",
            description: "Detailed statistics and game history at your fingertips"
        }
    ];

    const stats = [
        { value: "10K+", label: "Active Players" },
        { value: "50K+", label: "Games Played" },
        { value: "24/7", label: "Online Support" },
        { value: "100%", label: "Free to Play" }
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
            {/* Animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.15),transparent_50%)]" />
            </div>

            {/* Floating chess pieces */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 opacity-10 animate-float text-white">
                    <Crown size={64} />
                </div>
                <div className="absolute top-40 right-20 opacity-10 animate-float delay-1000 text-white">
                    <Crown size={56} />
                </div>
                <div className="absolute bottom-32 left-1/4 opacity-10 animate-float delay-2000 text-white">
                    <Crown size={72} />
                </div>
                <div className="absolute bottom-20 right-1/3 opacity-10 animate-float delay-3000 text-white">
                    <Crown size={64} />
                </div>
            </div>

            {/* Hero Section */}
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
                            onClick={createNewGame}
                            className="group relative px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white hover:text-gray-100 text-lg font-bold rounded-xl border border-emerald-600/30 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm min-w-[200px]"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span className="relative flex items-center justify-center gap-2">
                                {user ? "Start Playing" : "Get Started"}
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </button>
                        
                        <button
                            onClick={() => navigate("/lobby")}
                            className="group relative px-8 py-4 bg-slate-800/60 hover:bg-slate-700/60 text-lg font-semibold text-white hover:text-gray-100 overflow-hidden rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 min-w-[200px] cursor-pointer"
                        >
                            <span className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300" />
                            <span className="relative">Browse Lobbies</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="relative backdrop-blur-xl bg-slate-800/50 rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-slate-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
                        <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text">
                            Why Chess Arena?
                        </span>
                    </h2>
                    <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
                        Experience chess like never before with cutting-edge features designed for modern players
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative backdrop-blur-xl bg-slate-800/50 rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:transform hover:-translate-y-2"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <div className="mb-4 transform group-hover:scale-110 transition-transform text-emerald-400">
                                        <feature.icon size={48} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
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
                                onClick={() => navigate(user ? "/lobby" : "/register")}
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

            {/* Add animation keyframes */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
                .delay-2000 {
                    animation-delay: 2s;
                }
                .delay-3000 {
                    animation-delay: 3s;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}

export default Home;