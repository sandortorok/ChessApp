import { TabsList } from "./navigation";

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <aside className="w-64 hidden sm:block bg-slate-800/60 border-r border-emerald-600/30 sticky top-0 h-screen">
      <TabsList activeTab={activeTab} onTabChange={onTabChange} />
    </aside>
  );
}
