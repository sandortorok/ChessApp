interface TabItemProps {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}

export default function TabItem({ name, icon: Icon, isActive, onClick }: TabItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-all ${
        isActive
          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/10"
          : "text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent"
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
      <span>{name}</span>
    </button>
  );
}
