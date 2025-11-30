import { useState, useEffect } from "react";
import { auth, firestore } from "@/lib/firebase/config";
import { onAuthStateChanged, updateProfile, updatePassword, type User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  AvatarSection,
  AvatarModal,
  ProfileInfoSection,
  GamePreferencesSection,
  NotificationsSection,
  PrivacySection,
  SecuritySection,
  SuccessMessage
} from "./components";

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

export default function ProfileTab() {
  const [user, setUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Avatar state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarURL, setAvatarURL] = useState<string>("");
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    boardTheme: "classic",
    soundEnabled: true,
    volume: 50,
    emailNotifications: true,
    profileVisibility: "public",
    language: "en"
  });

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
    });
    return () => unsubscribe();
  }, []);

  const showMessage = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleUpdateName = async (displayName: string) => {
    if (!user || !displayName.trim()) return;
    
    try {
      await updateProfile(user, { displayName });
      // Force refresh the user object to reflect the updated displayName
      setUser({ ...user, displayName });
      showMessage("Name updated successfully!");
    } catch (error) {
      console.error("Failed to update name:", error);
      showMessage("Failed to update name");
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

  const handlePasswordChange = async (newPassword: string, confirmPassword: string) => {
    if (!user) return { success: false, error: "User not found" };
    
    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }
    
    if (newPassword !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }
    
    try {
      await updatePassword(user, newPassword);
      showMessage("Password updated successfully!");
      return { success: true };
    } catch (error: any) {
      console.error("Failed to update password:", error);
      if (error.code === "auth/requires-recent-login") {
        return { success: false, error: "Please log out and log back in before changing password" };
      } else {
        return { success: false, error: "Failed to update password" };
      }
    }
  };

  return (
    <div className="space-y-6">
      <SuccessMessage message={successMessage} />

      <AvatarSection 
        avatarURL={avatarURL}
        onChangeClick={() => setShowAvatarModal(true)}
      />

      <ProfileInfoSection 
        user={user}
        onUpdateName={handleUpdateName}
      />

      <GamePreferencesSection 
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <NotificationsSection 
        emailNotifications={settings.emailNotifications}
        onToggle={() => handleUpdateSettings({ emailNotifications: !settings.emailNotifications })}
      />

      <PrivacySection 
        profileVisibility={settings.profileVisibility}
        onVisibilityChange={(visibility) => handleUpdateSettings({ profileVisibility: visibility })}
      />

      <SecuritySection 
        onPasswordChange={handlePasswordChange}
      />

      <AvatarModal 
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        avatarOptions={AVATAR_OPTIONS}
        onSelectEmoji={handleEmojiAvatar}
        isLoading={uploadingAvatar}
      />
    </div>
  );
}