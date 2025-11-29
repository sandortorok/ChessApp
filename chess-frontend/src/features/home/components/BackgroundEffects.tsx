import { Crown } from "lucide-react";

export function BackgroundEffects() {
    return (
        <>
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
        </>
    );
}
