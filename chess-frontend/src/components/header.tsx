// src/components/Header.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { auth, firestore } from "../firebase/config";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Profile", href: "/profile" },
  { name: "Lobbies", href: "/lobby" },
  { name: "My Games", href: "/mygames" },
  { name: "Leaderboard", href: "/leaderboard" },
];

const DEFAULT_AVATAR = "emoji:👤";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarURL, setAvatarURL] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      console.log("Auth state changed, user:", firebaseUser);
      
      // Load avatar from Firestore
      if (firebaseUser) {
        const userDocRef = doc(firestore, "users", firebaseUser.uid);
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
        setAvatarURL("");
      }
    });
    
    // Listen for avatar updates from other components
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
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside 
        className="hidden lg:flex lg:flex-col w-64 bg-slate-800/60 backdrop-blur-lg border-r border-emerald-600/30 shadow-lg sticky top-0 h-screen"
      >
        {/* Logo */}
        <div className="p-6 border-b border-emerald-600/30">
          <a href="/" className="group flex items-center gap-3">
            <span className="sr-only">Chess App</span>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <img
                alt="Chess App"
                src="/logo.png"
                className="relative h-10 w-auto transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xl font-bold text-white">
              Chess Arena
            </span>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 border border-transparent hover:border-emerald-600/20"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-emerald-600/30">
          {user ? (
            <div className="space-y-3">
              <a
                href="/profile"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-emerald-600/20 hover:bg-slate-700/70 hover:border-emerald-600/40 transition-all duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden">
                  {avatarURL.startsWith('emoji:') ? (
                    <span className="text-2xl">{avatarURL.replace('emoji:', '')}</span>
                  ) : avatarURL ? (
                    <img src={avatarURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {user.displayName || "Player"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </a>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/30 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <a 
              href="/login" 
              className="block w-full px-6 py-2.5 text-sm font-semibold text-white text-center bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 rounded-lg transition-all duration-200"
            >
              Log in →
            </a>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <header 
        className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and title */}
          <a href="/" className="flex items-center gap-2">
            <img
              alt="Chess App"
              src="/logo.png"
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold text-white">
              Chess Arena
            </span>
          </a>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:text-emerald-400 hover:bg-slate-700/80 transition-all duration-200 active:bg-slate-700 border border-emerald-600/30"
            aria-label="Open main menu"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6 stroke-current" />
          </button>
        </div>
      </header>

      {/* Mobile navigation */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" />
        <DialogPanel className="fixed inset-y-0 right-0 z-[70] w-full overflow-y-auto bg-slate-900 p-6 sm:max-w-sm border-l border-emerald-600/30 shadow-2xl">
          <div className="flex items-center justify-between">
            <a href="/" className="group flex items-center gap-2 sm:gap-3">
              <span className="sr-only">Chess App</span>
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20" />
                <img
                  alt="Chess App"
                  src="/logo.png"
                  className="relative h-8 w-auto"
                />
              </div>
              <span className="text-base sm:text-lg font-bold text-white">
                Chess Arena
              </span>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-lg p-2.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 transition-all duration-200 active:bg-slate-800"
              aria-label="Close menu"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-8 flow-root">
            <div className="-my-6 divide-y divide-emerald-600/20">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-emerald-600/20 active:bg-slate-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6 space-y-4">
                {user && (
                  <a
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-emerald-600/20 hover:bg-slate-800/70 hover:border-emerald-600/40 transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0 overflow-hidden">
                      {avatarURL.startsWith('emoji:') ? (
                        <span className="text-2xl">{avatarURL.replace('emoji:', '')}</span>
                      ) : avatarURL ? (
                        <img src={avatarURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-300 truncate flex-1 min-w-0">
                      {user.email}
                    </span>
                  </a>
                )}
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="-mx-3 block w-full rounded-lg px-3 py-3 text-base font-semibold text-red-400 hover:bg-red-500/10 text-left transition-all duration-200 border border-transparent hover:border-red-500/30 active:bg-red-500/20"
                  >
                    Logout
                  </button>
                ) : (
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold text-center bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-white transition-all duration-200 active:bg-emerald-600/60"
                  >
                    Log in →
                  </a>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}