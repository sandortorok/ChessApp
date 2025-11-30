import { useState } from "react";
import SettingsSidebar from "../components/SettingsSidebar";
import SettingsMobileHeader from "../components/SettingsMobileHeader";
import ProfileTab from "./tabs/profile/ProfileTab";
import HistoryTab from "./tabs/history/HistoryTab";
import SecurityTab from "./tabs/security/SecurityTab";
import NotificationsTab from "./tabs/notifications/NotificationsTab";
import BillingTab from "./tabs/billing/BillingTab";
import FriendsTab from "./tabs/friends/FriendsTab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return <ProfileTab />;
      case "History":
        return <HistoryTab />;
      case "Security":
        return <SecurityTab />;
      case "Notifications":
        return <NotificationsTab />;
      case "Billing":
        return <BillingTab />;
      case "Friends":
        return <FriendsTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SettingsMobileHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto flex">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-6 md:p-8">
          <div className="hidden sm:block mb-6">
            <h1 className="text-3xl font-bold text-white">{activeTab}</h1>
            <p className="text-slate-400 mt-1">Manage your {activeTab.toLowerCase()} settings</p>
          </div>

          <div className="space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
