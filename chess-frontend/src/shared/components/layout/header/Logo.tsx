interface LogoProps {
  variant?: 'default' | 'mobile';
}

export default function Logo({ variant = 'default' }: LogoProps) {
  const isMobile = variant === 'mobile';

  return (
    <a
      href="/"
      className={`group flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}
    >
      <span className="sr-only">Chess App</span>
      <div className="relative">
        {!isMobile && (
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
        )}
        <img
          alt="Chess App"
          src="/logo.png"
          className={`relative ${isMobile ? 'h-8' : 'h-10'} w-auto ${!isMobile ? 'transform group-hover:scale-110 transition-transform duration-300' : ''}`}
        />
      </div>
      <span
        className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white`}
      >
        Chess Arena
      </span>
    </a>
  );
}
