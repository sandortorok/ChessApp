import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Zap, Trophy, Users, BarChart3 } from "lucide-react";
import { useState } from "react";
import { CreateGameModal, type GameSettings } from "@/features/lobby";
import { BackgroundEffects } from "../components/BackgroundEffects";
import { HeroSection } from "../components/HeroSection";
import StatsSection, { type StatItem } from "../components/StatsSection";
import FeaturesSection, { type Feature } from "../components/FeaturesSection";
import CTASection from "../components/CTASection";

function Home() {
    const user = useAuth();
    const navigate = useNavigate();
    const [showCreateGameModal, setShowCreateGameModal] = useState(false);

    const createNewGame = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        setShowCreateGameModal(true);
    };

    const handleCreateGame = (settings: GameSettings) => {
        const newGameId = Date.now().toString();
        console.log("Creating game with settings:", settings);
        navigate(`/game/${newGameId}`, { state: { gameSettings: settings } });
    };

    const features: Feature[] = [
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

    const stats: StatItem[] = [
        { value: "10K+", label: "Active Players" },
        { value: "50K+", label: "Games Played" },
        { value: "24/7", label: "Online Support" },
        { value: "100%", label: "Free to Play" }
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
            <BackgroundEffects />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
                <div className="max-w-5xl mx-auto text-center">
                    <HeroSection
                        user={user}
                        onCreateGame={createNewGame}
                        onBrowseLobbies={() => navigate("/lobby")}
                    />
                    <StatsSection stats={stats} />
                </div>
            </div>

            <FeaturesSection features={features} />

            <CTASection
                user={user}
                onNavigate={() => navigate(user ? "/lobby" : "/register")}
            />

            <CreateGameModal
                isOpen={showCreateGameModal}
                onClose={() => setShowCreateGameModal(false)}
                onCreate={handleCreateGame}
            />
        </div>
    );
}

export default Home;