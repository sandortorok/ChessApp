import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";

function Home() {
    const user = useAuth();
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

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
            icon: "⚡",
            title: "Real-time Play",
            description: "Experience instant moves with our blazing-fast game engine"
        },
        {
            icon: "🏆",
            title: "Competitive Ranking",
            description: "Climb the leaderboard and prove your chess mastery"
        },
        {
            icon: "👥",
            title: "Multiplayer Lobbies",
            description: "Join or create custom games with players worldwide"
        },
        {
            icon: "📊",
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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900">
            {/* Animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.15),transparent_50%)]" />
                
                {/* Mouse-following glow */}
                <div 
                    className="absolute w-96 h-96 rounded-full bg-teal-500/20 blur-3xl transition-all duration-300 pointer-events-none"
                    style={{
                        left: mousePosition.x - 192,
                        top: mousePosition.y - 192,
                    }}
                />
            </div>

            {/* Floating chess pieces */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">♔</div>
                <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float delay-1000">♕</div>
                <div className="absolute bottom-32 left-1/4 text-7xl opacity-10 animate-float delay-2000">♖</div>
                <div className="absolute bottom-20 right-1/3 text-6xl opacity-10 animate-float delay-3000">♗</div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Main heading */}
                    <div className="mb-8">
                        <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6">
                            <span className="inline-block bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-gradient">
                                Chess Arena
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Master the ancient game in a modern battlefield. Challenge players worldwide in real-time matches.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <button
                            onClick={createNewGame}
                            className="group relative px-8 py-4 text-lg font-semibold text-white overflow-hidden rounded-xl min-w-[200px]"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 transition-transform duration-300 group-hover:scale-105" />
                            <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center justify-center gap-2">
                                {user ? "Start Playing" : "Get Started"}
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </button>
                        
                        <button
                            onClick={() => navigate("/lobby")}
                            className="group relative px-8 py-4 text-lg font-semibold text-teal-400 overflow-hidden rounded-xl border-2 border-teal-500/50 hover:border-teal-500 transition-all duration-300 min-w-[200px]"
                        >
                            <span className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/10 transition-colors duration-300" />
                            <span className="relative">Browse Lobbies</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="relative backdrop-blur-xl bg-gray-900/30 rounded-2xl p-6 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 group"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
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
                        <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            Why Chess Arena?
                        </span>
                    </h2>
                    <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                        Experience chess like never before with cutting-edge features designed for modern players
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative backdrop-blur-xl bg-gray-900/30 rounded-2xl p-6 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:transform hover:-translate-y-2"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
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
                    <div className="relative backdrop-blur-xl bg-gray-900/50 rounded-3xl p-12 border border-teal-500/20 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
                        
                        <div className="relative text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Dominate the Board?
                            </h2>
                            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                                Join thousands of players in the ultimate chess experience. Create your account and start your journey to grandmaster today.
                            </p>
                            <button
                                onClick={() => navigate(user ? "/lobby" : "/register")}
                                className="group relative px-8 py-4 text-lg font-semibold text-white overflow-hidden rounded-xl"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 transition-transform duration-300 group-hover:scale-105" />
                                <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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