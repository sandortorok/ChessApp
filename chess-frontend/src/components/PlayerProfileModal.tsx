import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/config";

interface PlayerProfileModalProps {
  player: any;
  gameData?: any;
  playerColor?: "white" | "black";
  position: { top: number; left: number };
  openUpwards?: boolean;
  onClose: () => void;
}

const DEFAULT_AVATAR = "emoji:👤";

export default function PlayerProfileModal({
  player,
  gameData,
  playerColor,
  position,
  openUpwards,
  onClose
}: PlayerProfileModalProps) {
  const [avatarURL, setAvatarURL] = useState<string>(DEFAULT_AVATAR);
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper: check if player is guest (uid starts with "guest_")
  const isGuest = (player: any) => {
    return player?.uid?.startsWith("guest_");
  };

      // Close modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    // Load player avatar from Firestore
  useEffect(() => {
    const loadPlayerAvatar = async () => {
      if (player?.uid && !isGuest(player)) {
        try {
          const userDocRef = doc(firestore, "users", player.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.photoURL) {
              setAvatarURL(data.photoURL);
            } else {
              setAvatarURL(DEFAULT_AVATAR);
            }
          }
        } catch (error) {
          console.error("Failed to load player avatar:", error);
          setAvatarURL(DEFAULT_AVATAR);
        }
      } else {
        setAvatarURL(DEFAULT_AVATAR);
      }
    };

    loadPlayerAvatar();
  }, [player]);

  const modalContent = (
    <div
      ref={modalRef}
      className="fixed z-50 bg-slate-800 border border-emerald-600/50 rounded-lg shadow-xl shadow-emerald-500/20 p-4 min-w-[280px] max-h-[80vh] overflow-y-auto"
      style={{
        [openUpwards ? 'bottom' : 'top']: openUpwards 
          ? `${window.innerHeight - position.top}px`
          : `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">{/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
          {avatarURL.startsWith('emoji:') ? (
            <span className="text-2xl">{avatarURL.replace('emoji:', '')}</span>
          ) : avatarURL !== DEFAULT_AVATAR ? (
            <img src={avatarURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{isGuest(player) ? "🎮" : "👤"}</span>
          )}
        </div>
        
        <div>
          <p className="text-white font-semibold">
            {player.name || player.displayName || "Guest"}
          </p>
          {!isGuest(player) && (
            <div className="flex items-center gap-2">
              <p className="text-emerald-400 text-sm font-medium">
                ELO: {
                  gameData?.finalElo?.[playerColor!] ||
                  player.elo ||
                  1200
                }
              </p>
              {gameData?.status === "ended" && 
               gameData?.finalElo?.[playerColor!] && 
               gameData?.startingElo?.[playerColor!] && (
                <span className={`text-xs font-bold ${
                  (gameData.finalElo[playerColor!] - 
                   gameData.startingElo[playerColor!]) > 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                }`}>
                  ({(gameData.finalElo[playerColor!] - 
                     gameData.startingElo[playerColor!]) > 0 ? '+' : ''}
                  {gameData.finalElo[playerColor!] - 
                   gameData.startingElo[playerColor!]})
                </span>
              )}
            </div>
          )}
          {isGuest(player) && (
            <p className="text-slate-400 text-sm">
              🎮 Guest Player
            </p>
          )}
        </div>
      </div>
      
      <div className="border-t border-emerald-600/30 pt-3 space-y-2">
        {gameData?.startingElo?.[playerColor!] && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-300/70">Starting ELO:</span>
            <span className="text-white font-semibold">
              {gameData.startingElo[playerColor!]}
            </span>
          </div>
        )}
        {gameData?.finalElo?.[playerColor!] && 
         gameData?.startingElo?.[playerColor!] && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-300/70">Final ELO:</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">
                {gameData.finalElo[playerColor!]}
              </span>
              <span className={`text-xs font-bold ${
                (gameData.finalElo[playerColor!] - 
                 gameData.startingElo[playerColor!]) > 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
              }`}>
                ({(gameData.finalElo[playerColor!] - 
                   gameData.startingElo[playerColor!]) > 0 ? '+' : ''}
                {gameData.finalElo[playerColor!] - 
                 gameData.startingElo[playerColor!]})
              </span>
            </div>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-emerald-300/70">User ID:</span>
          <span className="text-white font-mono">{player.uid?.slice(0, 8) || "N/A"}</span>
        </div>
        {player.wins !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-300/70">Wins:</span>
            <span className="text-white">{player.wins || 0}</span>
          </div>
        )}
        {player.losses !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-300/70">Losses:</span>
            <span className="text-white">{player.losses || 0}</span>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
