import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { type User } from 'firebase/auth';
import Logo from './Logo';
import NavigationLinks from './NavigationLinks';
import UserSection from './UserSection';

interface MobileNavigationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  avatarURL: string;
  navigation: Array<{ name: string; href: string }>;
  onLogout: () => void;
}

export default function MobileNavigationDialog({
  isOpen,
  onClose,
  user,
  avatarURL,
  navigation,
  onLogout,
}: MobileNavigationDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="lg:hidden">
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
            onClick={onClose}
            className="-m-2.5 rounded-lg p-2.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 transition-all duration-200 active:bg-slate-800"
            aria-label="Close menu"
          >
            <span className="sr-only">Close menu</span>
            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8 flow-root">
          <div className="-my-6 divide-y divide-emerald-600/20">
            <div className="py-6">
              <NavigationLinks
                items={navigation}
                variant="mobile"
                onItemClick={onClose}
              />
            </div>
            <div className="py-6 space-y-4">
              <UserSection
                user={user}
                avatarURL={avatarURL}
                onLogout={onLogout}
                variant="mobile"
                onSettingsClick={onClose}
              />
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
