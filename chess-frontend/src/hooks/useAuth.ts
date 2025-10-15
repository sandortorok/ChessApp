import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile, type UserProfile } from "../services/userService";

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Betöltjük vagy létrehozzuk a felhasználó profilját
          const profile = await getUserProfile(firebaseUser);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return { user, userProfile, loading };
}
