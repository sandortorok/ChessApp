interface NavigationLinksProps {
  items: Array<{ name: string; href: string }>;
  variant?: 'desktop' | 'mobile';
  onItemClick?: () => void;
}

export default function NavigationLinks({
  items,
  variant = 'desktop',
  onItemClick,
}: NavigationLinksProps) {
  if (variant === 'mobile') {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-emerald-600/20 active:bg-slate-800"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            {item.name}
          </a>
        ))}
      </div>
    );
  }

  return (
    <nav className="flex-1 p-4 space-y-2">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="flex items-center px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 border border-transparent hover:border-emerald-600/20"
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
