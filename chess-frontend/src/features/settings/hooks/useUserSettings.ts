/**
 * useUserSettings Hook
 * Handles user settings state and persistence
 */

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../../firebase/config";
import { DEFAULT_AVATAR } from "../../../core/constants";

export interface UserSettings {
    boardTheme: string;
    soundEnabled: boolean;
    volume: number;
    emailNotifications: boolean;
    profileVisibility: string;
    language: string;
}

const DEFAULT_SETTINGS: UserSettings = {
    boardTheme: "classic",
    soundEnabled: true,
    volume: 50,
    emailNotifications: true,
    profileVisibility: "public",
    language: "en"
};

interface UseUserSettingsReturn {
    user: User | null;
    settings: UserSettings;
    avatarURL: string;
    setAvatarURL: (url: string) => void;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
    showMessage: (msg: string) => void;
    successMessage: string;
}

export function useUserSettings(): UseUserSettingsReturn {
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [avatarURL, setAvatarURL] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState("");

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
                        setSettings(prev => ({ ...prev, ...data.settings }));
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

    const showMessage = useCallback((msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 3000);
    }, []);

    const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
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
    }, [user, settings, showMessage]);

    return {
        user,
        settings,
        avatarURL,
        setAvatarURL,
        updateSettings,
        showMessage,
        successMessage
    };
}
