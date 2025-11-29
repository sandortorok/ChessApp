const DEFAULT_AVATAR = "emoji:👤";

interface PlayerAvatarProps {
    photoURL?: string;
    size?: "sm" | "md" | "lg";
}

export default function PlayerAvatar({ photoURL, size = "md" }: PlayerAvatarProps) {
    const containerSizeClasses = {
        sm: "w-10 h-10",
        md: "w-12 h-12",
        lg: "w-16 h-16",
    };

    const renderContent = () => {
        if (!photoURL || photoURL === DEFAULT_AVATAR) {
            return <span className="text-2xl">👤</span>;
        }
        if (photoURL.startsWith('emoji:')) {
            return <span className="text-2xl">{photoURL.replace('emoji:', '')}</span>;
        }
        return <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />;
    };

    return (
        <div className={`${containerSizeClasses[size]} rounded-full bg-emerald-600/20 flex items-center justify-center overflow-hidden border border-emerald-600/30`}>
            {renderContent()}
        </div>
    );
}
