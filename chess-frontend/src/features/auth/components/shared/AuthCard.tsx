import type { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="relative backdrop-blur-xl bg-gray-900/50 rounded-2xl shadow-2xl shadow-teal-500/10 border border-teal-500/20 p-8">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />
      <div className="relative">{children}</div>
    </div>
  );
}
