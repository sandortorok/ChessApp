// src/components/Header.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Profile", href: "/profile" },
  { name: "Lobbies", href: "/lobby" },
  { name: "My Games", href: "/mygames" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      console.log("Auth state changed, user:", firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-gray-900/95 backdrop-blur-lg border-b border-teal-500/20 shadow-lg shadow-teal-500/5" 
          : "bg-gradient-to-b from-gray-900 to-transparent border-b border-teal-500/10"
      }`}
    >
      <nav aria-label="Global" className="mx-auto max-w-7xl flex items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <a href="/" className="group -m-1.5 p-1.5 flex items-center gap-3">
            <span className="sr-only">Chess App</span>
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <img
                alt="Chess App"
                src="logo.png"
                className="relative h-10 w-auto transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              Chess Arena
            </span>
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="relative -m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-gray-300 hover:text-teal-400 hover:bg-gray-800/50 transition-all duration-200"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-2">
          {navigation.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              className="relative px-4 py-2 text-sm font-semibold text-gray-300 hover:text-teal-400 transition-colors duration-200 group"
            >
              <span className="relative z-10">{item.name}</span>
              <span className="absolute inset-0 rounded-lg bg-teal-500/0 group-hover:bg-teal-500/10 transition-all duration-200" />
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-teal-500/30">
                  {user.email?.[0].toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-400 hidden xl:block max-w-[150px] truncate">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-red-400 transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <a 
              href="/login" 
              className="group relative px-6 py-2.5 text-sm font-semibold text-white overflow-hidden rounded-lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Log in
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </a>
          )}
        </div>
      </nav>

      {/* Mobile navigation */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950 p-6 sm:max-w-sm sm:ring-1 sm:ring-teal-500/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <a href="/" className="group -m-1.5 p-1.5 flex items-center gap-3">
              <span className="sr-only">Chess App</span>
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20" />
                <img
                  alt="Chess App"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=teal&shade=500"
                  className="relative h-8 w-auto"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Chess Arena
              </span>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-lg p-2.5 text-gray-300 hover:text-teal-400 hover:bg-gray-800/50 transition-all duration-200"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>

          <div className="mt-8 flow-root">
            <div className="-my-6 divide-y divide-white/5">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group -mx-3 flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-gray-300 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6 space-y-4">
                {user && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-800/50 border border-teal-500/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-teal-500/30">
                      {user.email?.[0].toUpperCase() || "U"}
                    </div>
                    <span className="text-sm text-gray-400 truncate flex-1">
                      {user.email}
                    </span>
                  </div>
                )}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="-mx-3 block w-full rounded-xl px-3 py-3 text-base font-semibold text-red-400 hover:bg-red-500/10 text-left transition-all duration-200"
                  >
                    Logout
                  </button>
                ) : (
                  <a
                    href="/login"
                    className="-mx-3 block rounded-xl px-3 py-3 text-base font-semibold text-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 transition-all duration-200 shadow-lg shadow-teal-500/30"
                  >
                    Log in →
                  </a>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}