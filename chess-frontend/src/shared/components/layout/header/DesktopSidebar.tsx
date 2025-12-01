import { type User } from 'firebase/auth';
import Logo from './Logo';
import NavigationLinks from './NavigationLinks';
import UserSection from './UserSection';

interface DesktopSidebarProps {
  user: User | null;
  avatarURL: string;
  navigation: Array<{ name: string; href: string }>;
  onLogout: () => void;
}

export default function DesktopSidebar({
  user,
  avatarURL,
  navigation,
  onLogout,
}: DesktopSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-800/60 backdrop-blur-lg border-r border-emerald-600/30 shadow-lg sticky top-0 h-screen">
      <div className="p-6 border-b border-emerald-600/30">
        <Logo />
      </div>

      <NavigationLinks items={navigation} variant="desktop" />

      <div className="p-4 border-t border-emerald-600/30">
        <UserSection
          user={user}
          avatarURL={avatarURL}
          onLogout={onLogout}
          variant="desktop"
        />
      </div>
    </aside>
  );
}
