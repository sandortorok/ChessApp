import { type User } from 'firebase/auth';
import UserAvatar from './UserAvatar';

interface UserSectionProps {
  user: User | null;
  avatarURL: string;
  onLogout: () => void;
  variant?: 'desktop' | 'mobile';
  onSettingsClick?: () => void;
}

export default function UserSection({
  user,
  avatarURL,
  onLogout,
  variant = 'desktop',
  onSettingsClick,
}: UserSectionProps) {
  if (!user) {
    return (
      <a
        href="/login"
        onClick={onSettingsClick}
        className={`block w-full px-6 py-2.5 text-sm font-semibold text-white text-center bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 rounded-lg transition-all duration-200 ${variant === 'mobile' ? '-mx-3 px-3 py-3 text-base active:bg-emerald-600/60' : ''}`}
      >
        Log in →
      </a>
    );
  }

  if (variant === 'mobile') {
    return (
      <>
        <a
          href="/settings"
          onClick={onSettingsClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-emerald-600/20 hover:bg-slate-800/70 hover:border-emerald-600/40 transition-all duration-200 cursor-pointer"
        >
          <UserAvatar avatarURL={avatarURL} size="medium" />
          <span className="text-sm text-slate-300 truncate flex-1 min-w-0">
            {user.email}
          </span>
        </a>
        <button
          onClick={() => {
            onLogout();
            onSettingsClick?.();
          }}
          className="-mx-3 block w-full rounded-lg px-3 py-3 text-base font-semibold text-red-400 hover:bg-red-500/10 text-left transition-all duration-200 border border-transparent hover:border-red-500/30 active:bg-red-500/20"
        >
          Logout
        </button>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <a
        href="/settings"
        className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-emerald-600/20 hover:bg-slate-700/70 hover:border-emerald-600/40 transition-all duration-200 cursor-pointer"
      >
        <UserAvatar avatarURL={avatarURL} size="medium" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate">
            {user.displayName || 'Player'}
          </p>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
        </div>
      </a>
      <button
        onClick={onLogout}
        className="w-full px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/30 transition-all duration-200"
      >
        Logout
      </button>
    </div>
  );
}
