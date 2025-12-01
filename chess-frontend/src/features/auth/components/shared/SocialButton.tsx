interface SocialButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

export function SocialButton({
  onClick,
  icon,
  label,
  disabled,
}: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex items-center justify-center gap-2 rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
