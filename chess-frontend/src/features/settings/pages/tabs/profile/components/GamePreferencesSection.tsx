import { Palette, Volume2 } from "lucide-react";

interface GameSettings {
  boardTheme: string;
  soundEnabled: boolean;
  volume: number;
}

interface GamePreferencesSectionProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export default function GamePreferencesSection({ settings, onUpdateSettings }: GamePreferencesSectionProps) {
  return (
    <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-400" />
          Game Preferences
        </h3>
      </div>

      <div className="divide-y divide-emerald-600/20">
        {/* Board Theme */}
        <div className="px-6 py-6 hover:bg-slate-700/30 transition-colors">
          <label className="text-sm font-medium text-emerald-300 mb-3 block">Board Theme</label>
          <select
            value={settings.boardTheme}
            onChange={(e) => onUpdateSettings({ boardTheme: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-emerald-500/50 text-white rounded-lg focus:outline-none focus:border-emerald-400"
          >
            <option value="classic">Classic Brown</option>
            <option value="wood">Wood Texture</option>
            <option value="modern">Modern Dark</option>
            <option value="neon">Neon Green</option>
          </select>
        </div>

        {/* Sound Settings */}
        <div className="px-6 py-6 hover:bg-slate-700/30 transition-colors">
          <label className="text-sm font-medium text-emerald-300 mb-3 block">Sound Effects</label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Enable Sounds</span>
              <button
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-600'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            {settings.soundEnabled && (
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => onUpdateSettings({ volume: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-white text-sm w-10">{settings.volume}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
