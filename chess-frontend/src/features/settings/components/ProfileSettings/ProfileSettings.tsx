/**
 * ProfileSettings Component
 * Handles profile picture and display name settings
 */

import { useState, useCallback } from "react";
import { updateProfile, type User } from "firebase/auth";
import { Camera, X } from "lucide-react";
import { AVATAR_OPTIONS } from "../../../../core/constants";
import { useAvatarUpload } from "../../hooks/useAvatarUpload";

interface ProfileSettingsProps {
    user: User | null;
    avatarURL: string;
    setAvatarURL: (url: string) => void;
    showMessage: (msg: string) => void;
}

export function ProfileSettings({
    user,
    avatarURL,
    setAvatarURL,
    showMessage
}: ProfileSettingsProps) {
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    const {
        uploadingAvatar,
        fileInputRef,
        handleEmojiAvatar,
        handleFileSelect
    } = useAvatarUpload({
        user,
        setAvatarURL,
        showMessage,
        onSuccess: () => setShowAvatarModal(false)
    });

    const handleUpdateName = useCallback(async () => {
        if (!user || !displayName.trim()) return;
        
        setIsSaving(true);
        try {
            await updateProfile(user, { displayName });
            showMessage("Name updated successfully!");
            setIsEditingName(false);
        } catch (error) {
            console.error("Failed to update name:", error);
            showMessage("Failed to update name");
        } finally {
            setIsSaving(false);
        }
    }, [user, displayName, showMessage]);

    return (
        <>
            {/* Avatar Section */}
            <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
                    <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                    <p className="mt-1 text-sm text-emerald-300/70">
                        Upload a photo or choose an avatar
                    </p>
                </div>
                
                <div className="px-6 py-6">
                    <div className="flex items-center gap-6">
                        {/* Current Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center">
                                {avatarURL.startsWith('emoji:') ? (
                                    <span className="text-5xl">{avatarURL.replace('emoji:', '')}</span>
                                ) : avatarURL ? (
                                    <img src={avatarURL} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl">👤</span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowAvatarModal(true)}
                                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <Camera className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Avatar Actions */}
                        <div className="flex-1">
                            <button
                                onClick={() => setShowAvatarModal(true)}
                                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all"
                            >
                                Change Avatar
                            </button>
                            <p className="mt-2 text-xs text-slate-400">
                                JPG, PNG or GIF. Max size 2MB
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
                    <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                    <p className="mt-1 text-sm text-emerald-300/70">
                        Update your account profile information
                    </p>
                </div>

                <div className="divide-y divide-emerald-600/20">
                    {/* Full Name */}
                    <div className="px-6 py-6 hover:bg-slate-700/30 transition-colors">
                        <label className="text-sm font-medium text-emerald-300 mb-3 block">Full Name</label>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    disabled={!isEditingName}
                                    className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all ${
                                        isEditingName
                                            ? "bg-slate-700/50 border border-emerald-500/50 text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-400"
                                            : "bg-slate-900/50 border border-emerald-600/20 text-white cursor-default"
                                    }`}
                                    placeholder="Enter your name"
                                />
                            </div>
                            {!isEditingName ? (
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all whitespace-nowrap"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateName}
                                        disabled={isSaving}
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-all whitespace-nowrap"
                                    >
                                        {isSaving ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingName(false);
                                            setDisplayName(user?.displayName || "");
                                        }}
                                        className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-medium rounded-lg border border-slate-600/30 transition-all whitespace-nowrap"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="px-6 py-6 hover:bg-slate-700/30 transition-colors">
                        <label className="text-sm font-medium text-emerald-300 mb-3 block">Email Address</label>
                        <div className="px-4 py-2.5 bg-slate-900/50 border border-emerald-600/20 text-white rounded-lg font-medium">
                            {user?.email || "Not set"}
                        </div>
                        <p className="mt-2 text-xs text-slate-400">Contact support to change your email</p>
                    </div>
                </div>
            </div>

            {/* Avatar Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-emerald-600/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-emerald-600/30 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
                            <h3 className="text-xl font-bold text-white">Choose Avatar</h3>
                            <button
                                onClick={() => setShowAvatarModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Upload Photo */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Upload Photo</h4>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="w-full px-6 py-4 bg-emerald-600/20 hover:bg-emerald-600/40 disabled:bg-emerald-600/10 text-emerald-400 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-3"
                                >
                                    <Camera className="w-5 h-5" />
                                    {uploadingAvatar ? "Uploading..." : "Upload from device"}
                                </button>
                            </div>

                            {/* Emoji Avatars */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Choose Emoji</h4>
                                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                                    {AVATAR_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiAvatar(emoji)}
                                            disabled={uploadingAvatar}
                                            className="aspect-square bg-slate-700/50 hover:bg-slate-600/50 border border-emerald-600/20 hover:border-emerald-500/50 rounded-lg flex items-center justify-center text-3xl transition-all disabled:opacity-50 hover:scale-110"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
