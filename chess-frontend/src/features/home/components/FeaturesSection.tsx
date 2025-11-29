import type { LucideIcon } from "lucide-react";

export interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface FeaturesSectionProps {
    features: Feature[];
}

function FeaturesSection({ features }: FeaturesSectionProps) {
    return (
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
    );
}

export default FeaturesSection;
