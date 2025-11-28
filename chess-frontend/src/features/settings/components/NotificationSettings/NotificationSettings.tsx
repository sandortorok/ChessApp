/**
 * NotificationSettings Component
 * Handles email notification settings
 */

import { Bell } from "lucide-react";
import type { UserSettings } from "../../hooks/useUserSettings";

interface NotificationSettingsProps {
    settings: UserSettings;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

export function NotificationSettings({ settings, updateSettings }: NotificationSettingsProps) {
    return (
        <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-400" />
                    Notifications
                </h3>
            </div>

            <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">Email Notifications</p>
                        <p className="text-sm text-slate-400 mt-1">Receive email about game invitations and results</p>
                    </div>
                    <button
                        onClick={() => updateSettings({ emailNotifications: !settings.emailNotifications })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.emailNotifications ? 'bg-emerald-600' : 'bg-slate-600'
                        }`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
