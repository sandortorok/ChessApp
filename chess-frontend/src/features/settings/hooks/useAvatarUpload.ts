/**
 * useAvatarUpload Hook
 * Handles avatar upload and emoji selection
 */

import { useState, useCallback, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage, firestore } from "../../../firebase/config";
import type { User } from "firebase/auth";

interface UseAvatarUploadProps {
    user: User | null;
    setAvatarURL: (url: string) => void;
    showMessage: (msg: string) => void;
    onSuccess?: () => void;
}

interface UseAvatarUploadReturn {
    uploadingAvatar: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleAvatarUpload: (file: File) => Promise<void>;
    handleEmojiAvatar: (emoji: string) => Promise<void>;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useAvatarUpload({
    user,
    setAvatarURL,
    showMessage,
    onSuccess
}: UseAvatarUploadProps): UseAvatarUploadReturn {
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = useCallback(async (file: File): Promise<void> => {
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
            onSuccess?.();
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            showMessage("Failed to upload avatar");
        } finally {
            setUploadingAvatar(false);
        }
    }, [user, setAvatarURL, showMessage, onSuccess]);

    const handleEmojiAvatar = useCallback(async (emoji: string): Promise<void> => {
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
            onSuccess?.();
        } catch (error) {
            console.error("Failed to update avatar:", error);
            showMessage("Failed to update avatar");
        } finally {
            setUploadingAvatar(false);
        }
    }, [user, setAvatarURL, showMessage, onSuccess]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            handleAvatarUpload(file);
        }
    }, [handleAvatarUpload]);

    return {
        uploadingAvatar,
        fileInputRef,
        handleAvatarUpload,
        handleEmojiAvatar,
        handleFileSelect
    };
}
