/**
 * SecuritySettings Component
 * Handles password change and privacy settings
 */

import { useState, useCallback } from "react";
import { updatePassword, type User } from "firebase/auth";
import { Lock } from "lucide-react";
import type { UserSettings } from "../../hooks/useUserSettings";

interface SecuritySettingsProps {
    user: User | null;
    settings: UserSettings;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
    showMessage: (msg: string) => void;
}

export function SecuritySettings({
    user,
    settings,
    updateSettings,
    showMessage
}: SecuritySettingsProps) {
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const handlePasswordChange = useCallback(async () => {
        if (!user) return;
        
        setPasswordError("");
        
        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        
        try {
            await updatePassword(user, newPassword);
            showMessage("Password updated successfully!");
            setShowPasswordChange(false);
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: unknown) {
            console.error("Failed to update password:", error);
            if (error && typeof error === 'object' && 'code' in error && error.code === "auth/requires-recent-login") {
                setPasswordError("Please log out and log back in before changing password");
            } else {
                setPasswordError("Failed to update password");
            }
        }
    }, [user, newPassword, confirmPassword, showMessage]);

    return (
        <>
            {/* Privacy Settings */}
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
                        value={settings.profileVisibility}
                        onChange={(e) => updateSettings({ profileVisibility: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-emerald-500/50 text-white rounded-lg focus:outline-none focus:border-emerald-400"
                    >
                        <option value="public">Public - Anyone can see your profile</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private - Only you can see your stats</option>
                    </select>
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-emerald-400" />
                        Security
                    </h3>
                </div>

                <div className="px-6 py-6">
                    {!showPasswordChange ? (
                        <button
                            onClick={() => setShowPasswordChange(true)}
                            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all"
                        >
                            Change Password
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-emerald-300 mb-2 block">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-emerald-500/50 text-white rounded-lg focus:outline-none focus:border-emerald-400"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-emerald-300 mb-2 block">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-emerald-500/50 text-white rounded-lg focus:outline-none focus:border-emerald-400"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            {passwordError && (
                                <p className="text-red-400 text-sm">{passwordError}</p>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePasswordChange}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all"
                                >
                                    Update Password
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setNewPassword("");
                                        setConfirmPassword("");
                                        setPasswordError("");
                                    }}
                                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-medium rounded-lg border border-slate-600/30 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
