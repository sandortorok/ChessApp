import { X } from "lucide-react";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarOptions: string[];
  onSelectEmoji: (emoji: string) => void;
  isLoading: boolean;
}

export default function AvatarModal({
  isOpen,
  onClose,
  avatarOptions,
  onSelectEmoji,
  isLoading
}: AvatarModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-emerald-600/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-emerald-600/30 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
          <h3 className="text-xl font-bold text-white">Choose Avatar</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Choose Emoji</h4>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSelectEmoji(emoji)}
                  disabled={isLoading}
                  className="aspect-square bg-slate-700/50 hover:bg-slate-600/50 border border-emerald-600/20 hover:border-emerald-500/50 rounded-lg flex items-center justify-center text-3xl transition-all disabled:opacity-50 hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
