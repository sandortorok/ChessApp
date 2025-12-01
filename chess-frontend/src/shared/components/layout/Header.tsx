import { useState, useEffect } from 'react';
import { auth, firestore } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import DesktopSidebar from './header/DesktopSidebar';
import MobileHeader from './header/MobileHeader';
import MobileNavigationDialog from './header/MobileNavigationDialog';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Settings', href: '/settings' },
  { name: 'Lobbies', href: '/lobby' },
  { name: 'Game History', href: '/game-history' },
  { name: 'Leaderboard', href: '/leaderboard' },
];

const DEFAULT_AVATAR = 'emoji:👤';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarURL, setAvatarURL] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.photoURL) {
            setAvatarURL(data.photoURL);
          } else if (firebaseUser.photoURL) {
            setAvatarURL(firebaseUser.photoURL);
          } else {
            setAvatarURL(DEFAULT_AVATAR);
          }
        } else if (firebaseUser.photoURL) {
          setAvatarURL(firebaseUser.photoURL);
        } else {
          setAvatarURL(DEFAULT_AVATAR);
        }
      } else {
        setAvatarURL('');
      }
    });

    const handleAvatarUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.photoURL) {
        setAvatarURL(customEvent.detail.photoURL);
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <DesktopSidebar
        user={user}
        avatarURL={avatarURL}
        navigation={navigation}
        onLogout={handleLogout}
      />

      <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

      <MobileNavigationDialog
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        avatarURL={avatarURL}
        navigation={navigation}
        onLogout={handleLogout}
      />
    </>
  );
}
