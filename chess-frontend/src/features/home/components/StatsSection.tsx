export interface StatItem {
    value: string;
    label: string;
}

interface StatsSectionProps {
    stats: StatItem[];
}

function StatsSection({ stats }: StatsSectionProps) {
    return (
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
    );
}

export default StatsSection;
