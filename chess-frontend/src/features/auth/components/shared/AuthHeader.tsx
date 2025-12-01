interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <a href="/" className="inline-block group">
        <div className="relative">
          <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <img
            alt="Chess Arena"
            src="logo.png"
            className="relative mx-auto h-16 w-auto transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </a>
      <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}
