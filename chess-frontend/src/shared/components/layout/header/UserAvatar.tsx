interface UserAvatarProps {
  avatarURL: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-8 h-8 text-xl',
  medium: 'w-10 h-10 text-2xl',
  large: 'w-12 h-12 text-3xl',
};

export default function UserAvatar({
  avatarURL,
  size = 'medium',
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden`}
    >
      {avatarURL.startsWith('emoji:') ? (
        <span className={size === 'small' ? 'text-xl' : 'text-2xl'}>
          {avatarURL.replace('emoji:', '')}
        </span>
      ) : avatarURL ? (
        <img
          src={avatarURL}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={size === 'small' ? 'text-xl' : 'text-2xl'}>👤</span>
      )}
    </div>
  );
}
