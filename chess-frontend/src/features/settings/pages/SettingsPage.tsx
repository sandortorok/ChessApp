/**
 * SettingsPage
 * Main settings page that combines all settings components
 */

import { useUserSettings } from "../hooks/useUserSettings";
import { ProfileSettings } from "../components/ProfileSettings";
import { GameSettings } from "../components/GameSettings";
import { NotificationSettings } from "../components/NotificationSettings";
import { SecuritySettings } from "../components/SecuritySettings";

export default function SettingsPage() {
    const {
        user,
        settings,
        avatarURL,
        setAvatarURL,
        updateSettings,
        showMessage,
        successMessage
    } = useUserSettings();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-lg animate-pulse">
                        {successMessage}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-emerald-600/30 pb-6">
                        <h2 className="text-3xl font-bold text-white">Settings</h2>
                        <p className="mt-2 text-emerald-300/70">Manage your profile and preferences</p>
                    </div>

                    {/* Profile Settings */}
                    <ProfileSettings
                        user={user}
                        avatarURL={avatarURL}
                        setAvatarURL={setAvatarURL}
                        showMessage={showMessage}
                    />

                    {/* Game Settings */}
                    <GameSettings
                        settings={settings}
                        updateSettings={updateSettings}
                    />

                    {/* Notification Settings */}
                    <NotificationSettings
                        settings={settings}
                        updateSettings={updateSettings}
                    />

                    {/* Security Settings */}
                    <SecuritySettings
                        user={user}
                        settings={settings}
                        updateSettings={updateSettings}
                        showMessage={showMessage}
                    />
                </div>
            </div>
        </div>
    );
}
