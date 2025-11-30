interface AvatarSectionProps {
  avatarURL: string;
  onChangeClick: () => void;
}

export default function AvatarSection({ avatarURL, onChangeClick }: AvatarSectionProps) {
  return (
    <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
        <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
        <p className="mt-1 text-sm text-emerald-300/70">
          Choose an emoji avatar
        </p>
      </div>
      
      <div className="px-6 py-6">
        <div className="flex items-center gap-6">
          {/* Current Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center">
              {avatarURL.startsWith('emoji:') ? (
                <span className="text-5xl">{avatarURL.replace('emoji:', '')}</span>
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
          </div>

          {/* Avatar Actions */}
          <div className="flex-1">
            <button
              onClick={onChangeClick}
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all"
            >
              Change Avatar
            </button>
            <p className="mt-2 text-xs text-slate-400">
              Choose from emoji avatars
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
