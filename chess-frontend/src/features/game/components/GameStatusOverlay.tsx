

type OverlayVariant = "waiting" | "waitingForPlayers" | "viewingHistory";

interface GameStatusOverlayProps {
    variant: OverlayVariant;
    subtitle?: string;
}

const variantConfig: Record<
    OverlayVariant,
    {
        bgGradient: string;
        textGradient: string;
        icon: string;
        title: string;
        animate?: boolean;
    }
> = {
    waiting: {
        bgGradient: "from-yellow-500 to-orange-500",
        textGradient: "from-yellow-400 via-orange-400 to-yellow-400",
        icon: "⏳",
        title: "WAITING",
        animate: true,
    },
    waitingForPlayers: {
        bgGradient: "from-blue-500 to-purple-500",
        textGradient: "from-blue-400 via-purple-400 to-blue-400",
        icon: "👥",
        title: "WAITING FOR PLAYERS",
        animate: true,
    },
    viewingHistory: {
        bgGradient: "from-teal-500 to-cyan-500",
        textGradient: "from-teal-400 via-cyan-400 to-teal-400",
        icon: "📜",
        title: "Történet megtekintése",
        animate: false,
    },
};

export default function GameStatusOverlay({ variant, subtitle }: GameStatusOverlayProps) {
    const config = variantConfig[variant];
    const isSmall = variant === "viewingHistory";

    return (
        <div
            className={`absolute ${
                isSmall
                    ? "-top-3 left-1/2 transform -translate-x-1/2"
                    : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            } z-20`}
        >
            <div className="relative">
                <div
                    className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} ${
                        isSmall ? "rounded-full blur-lg" : "rounded-2xl blur-2xl"
                    } opacity-${isSmall ? "70" : "60"}`}
                />
                <div
                    className={`relative bg-gradient-to-r ${config.textGradient} text-gray-900 ${
                        isSmall
                            ? "px-5 py-1.5 rounded-full text-xs"
                            : "px-8 py-3 rounded-2xl text-lg"
                    } font-bold shadow-${isSmall ? "xl" : "2xl"} border-${isSmall ? "2" : "4"} border-white/${
                        isSmall ? "30" : "40"
                    } ${config.animate ? "animate-pulse" : "animate-gradient"}`}
                >
                    {config.icon} {config.title}
                    {subtitle && <div className="text-xs font-normal mt-1 opacity-80">{subtitle}</div>}
                </div>
            </div>
        </div>
    );
}
