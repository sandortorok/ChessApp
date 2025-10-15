import { useState } from "react";
import {
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  CreditCardIcon,
  UsersIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import GeneralSettings from "../components/GeneralSettings";

const tabs = [
  { name: "Profile", icon: CogIcon },
  { name: "History", icon: ClipboardIcon },
  { name: "Security", icon: ShieldCheckIcon },
  { name: "Notifications", icon: BellIcon },
  { name: "Billing", icon: CreditCardIcon },
  { name: "Friends", icon: UsersIcon },
];

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <aside className="w-64 hidden sm:block bg-slate-800/60 border-r border-emerald-600/30 sticky top-0 h-screen">
      <nav className="p-4 space-y-2">
        <h3 className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider px-3 py-2 mb-4">
          Settings
        </h3>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-all ${
                isActive
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Header */}
      <div className="sm:hidden border-b border-emerald-600/30 bg-slate-800/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
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

      <div className="max-w-7xl mx-auto flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="hidden sm:block mb-6">
            <h1 className="text-3xl font-bold text-white">{activeTab}</h1>
            <p className="text-slate-400 mt-1">Manage your {activeTab.toLowerCase()} settings</p>
          </div>

          <div className="space-y-6">
            {activeTab === "Profile" && <GeneralSettings />}
            
            {activeTab === "History" && (
              <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg p-8 text-center">
                <ClipboardIcon className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Game History</h3>
                <p className="text-slate-400">Your game history will be displayed here</p>
              </div>
            )}
            
            {activeTab === "Security" && (
              <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg p-8 text-center">
                <ShieldCheckIcon className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Security Settings</h3>
                <p className="text-slate-400">Manage your security preferences and passwords</p>
              </div>
            )}
            
            {activeTab === "Notifications" && (
              <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg p-8 text-center">
                <BellIcon className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Notifications</h3>
                <p className="text-slate-400">Control your notification preferences</p>
              </div>
            )}
            
            {activeTab === "Billing" && (
              <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg p-8 text-center">
                <CreditCardIcon className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Billing & Payments</h3>
                <p className="text-slate-400">Manage your billing information</p>
              </div>
            )}
            
            {activeTab === "Friends" && (
              <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg p-8 text-center">
                <UsersIcon className="w-12 h-12 text-pink-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Friends</h3>
                <p className="text-slate-400">Manage your friends and connections</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}