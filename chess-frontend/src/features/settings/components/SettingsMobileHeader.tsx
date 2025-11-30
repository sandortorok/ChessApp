import { tabs } from "./navigation";

interface SettingsMobileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SettingsMobileHeader({ activeTab, onTabChange }: SettingsMobileHeaderProps) {
  return (
    <div className="sm:hidden border-b border-emerald-600/30 bg-slate-800/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700/50 border border-emerald-600/30 text-white rounded-lg focus:outline-none focus:border-emerald-500"
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.name}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
