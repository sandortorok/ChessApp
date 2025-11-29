import { useState, useEffect, useRef } from "react";
import { auth, storage, firestore } from "@/lib/firebase/config";
import { onAuthStateChanged, updateProfile, updatePassword, type User } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Camera, Volume2, Bell, Lock, Palette, X } from "lucide-react";

// Előre definiált avatar opciók
const AVATAR_OPTIONS = [
  "👤", "🧑", "👨", "👩", "🧔", "👨‍💼", "👩‍💼",  "👨‍🎓", "👩‍🎓",
  "🤴", "👸", "🦸", "🦹", "🧙", "🧝", "🧛", "🧟", "🤖", "👽"
];  

const DEFAULT_AVATAR = "emoji:👤";

interface UserSettings {
  boardTheme: string;
  soundEnabled: boolean;
  volume: number;
  emailNotifications: boolean;
  profileVisibility: string;
  language: string;
}

export default function GeneralSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Avatar state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    boardTheme: "classic",
    soundEnabled: true,
    volume: 50,
    emailNotifications: true,
    profileVisibility: "public",
    language: "en"
  });
  
  // Separate state for avatar URL (can be from Firestore)
  const [avatarURL, setAvatarURL] = useState<string>("");
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load user settings from Firestore
        const userDocRef = doc(firestore, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Load avatar from Firestore (may be emoji: format)
          if (data.photoURL) {
            setAvatarURL(data.photoURL);
          } else if (firebaseUser.photoURL) {
            setAvatarURL(firebaseUser.photoURL);
          } else {
            setAvatarURL(DEFAULT_AVATAR);
          }
          
          if (data.settings) {
            setSettings({ ...settings, ...data.settings });
          }
        } else if (firebaseUser.photoURL) {
          setAvatarURL(firebaseUser.photoURL);
        } else {
          setAvatarURL(DEFAULT_AVATAR);
        }
      }
      
      setUser(firebaseUser);
      setDisplayName(firebaseUser?.displayName || "");
    });
    return () => unsubscribe();
  }, []);

  const showMessage = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleUpdateName = async () => {
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
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    
    setUploadingAvatar(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Save to Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, { photoURL }, { merge: true });
      
      // Update local state immediately
      setAvatarURL(photoURL);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { photoURL } }));
      
      showMessage("Avatar updated successfully!");
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      showMessage("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEmojiAvatar = async (emoji: string) => {
    if (!user) return;
    
    setUploadingAvatar(true);
    try {
      // Store emoji as photoURL with a special prefix
      const photoURL = `emoji:${emoji}`;
      
      // Save to Firestore only (don't update Firebase Auth profile)
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, { photoURL }, { merge: true });
      
      // Update local state immediately
      setAvatarURL(photoURL);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { photoURL } }));
      
      showMessage("Avatar updated successfully!");
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      showMessage("Failed to update avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, { settings: updatedSettings }, { merge: true });
      showMessage("Settings saved!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showMessage("Failed to save settings");
    }
  };

  const handlePasswordChange = async () => {
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
    } catch (error: any) {
      console.error("Failed to update password:", error);
      if (error.code === "auth/requires-recent-login") {
        setPasswordError("Please log out and log back in before changing password");
      } else {
        setPasswordError("Failed to update password");
      }
    }
  };

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

          {/* Game Settings */}
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
                  onChange={(e) => handleUpdateSettings({ boardTheme: e.target.value })}
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
                      onClick={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
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
                        onChange={(e) => handleUpdateSettings({ volume: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-white text-sm w-10">{settings.volume}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
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
                  onClick={() => handleUpdateSettings({ emailNotifications: !settings.emailNotifications })}
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
                onChange={(e) => handleUpdateSettings({ profileVisibility: e.target.value })}
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
      </div>
    </div>
  );
}