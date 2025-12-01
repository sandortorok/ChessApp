import { Bars3Icon } from '@heroicons/react/24/outline';
import Logo from './Logo';

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export default function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and title */}
        <Logo variant="mobile" />

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuOpen}
          className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:text-emerald-400 hover:bg-slate-700/80 transition-all duration-200 active:bg-slate-700 border border-emerald-600/30"
          aria-label="Open main menu"
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon aria-hidden="true" className="h-6 w-6 stroke-current" />
        </button>
      </div>
    </header>
  );
}
