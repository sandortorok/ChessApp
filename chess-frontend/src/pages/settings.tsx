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
    <aside className="w-64 hidden sm:block bg-teal-900 border-gray-700">
      <nav className="p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md font-medium cursor-pointer ${
                activeTab === tab.name
                  ? "bg-teal-700 text-white"
                  : "text-gray-300 hover:bg-teal-700 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 text-gray-400" />
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
    <div className="min-h-screen bg-teal-900 text-white">
      <div className="max-w-7xl mx-auto flex pt-6">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-4 space-y-8">
          {activeTab === "Profile" && <GeneralSettings />}
          {activeTab === "History" && <div>History settings content</div>}
          {activeTab === "Security" && <div>Security settings content</div>}
          {activeTab === "Notifications" && <div>Notifications settings content</div>}
          {activeTab === "Billing" && <div>Billing settings content</div>}
          {activeTab === "Friends" && <div>Friends settings content</div>}
        </main>
      </div>
    </div>
  );
}

