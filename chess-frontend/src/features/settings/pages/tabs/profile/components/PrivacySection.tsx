import { Lock } from "lucide-react";

interface PrivacySectionProps {
  profileVisibility: string;
  onVisibilityChange: (visibility: string) => void;
}

export default function PrivacySection({ profileVisibility, onVisibilityChange }: PrivacySectionProps) {
  return (
    <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          Privacy
        </h3>
      </div>

      <div className="px-6 py-6">
        <label className="text-sm font-medium text-emerald-300 mb-3 block">Profile Visibility</label>
        <select
          value={profileVisibility}
          onChange={(e) => onVisibilityChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-emerald-500/50 text-white rounded-lg focus:outline-none focus:border-emerald-400"
        >
          <option value="public">Public - Anyone can see your profile</option>
          <option value="friends">Friends Only</option>
          <option value="private">Private - Only you can see your stats</option>
        </select>
      </div>
    </div>
  );
}
