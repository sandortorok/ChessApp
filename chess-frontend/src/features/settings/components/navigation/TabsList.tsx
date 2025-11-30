import {
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  CreditCardIcon,
  UsersIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import TabItem from "./TabItem";

export const tabs = [
  { name: "Profile", icon: CogIcon },
  { name: "History", icon: ClipboardIcon },
  { name: "Security", icon: ShieldCheckIcon },
  { name: "Notifications", icon: BellIcon },
  { name: "Billing", icon: CreditCardIcon },
  { name: "Friends", icon: UsersIcon },
];

interface TabsListProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabsList({ activeTab, onTabChange }: TabsListProps) {
  return (
    <nav className="p-4 space-y-2">
      <h3 className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider px-3 py-2 mb-4">
        Settings
      </h3>
      {tabs.map((tab) => (
        <TabItem
          key={tab.name}
          name={tab.name}
          icon={tab.icon}
          isActive={activeTab === tab.name}
          onClick={() => onTabChange(tab.name)}
        />
      ))}
    </nav>
  );
}
