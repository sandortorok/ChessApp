import { useState, useRef } from "react";
import PlayerProfileModal from "./components/PlayerProfileModal";

interface PlayerInfoProps {
  color: "white" | "black";
  player: {
    uid?: string;
    name?: string;
    elo?: number;
    wins?: number;
    losses?: number;
  } | null;
  position?: "top" | "bottom";
  startingElo?: number;
  currentElo?: number;
  eloChange?: number;
}

export default function PlayerInfo({ color, player, position = "top", startingElo, currentElo, eloChange }: PlayerInfoProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if player is guest
  const isGuest = player?.uid?.startsWith("guest_");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!player?.uid) return;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 250;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Decide if modal should open upwards
      const shouldOpenUpwards = position === "bottom" || (spaceBelow < dropdownHeight && spaceAbove > spaceBelow);

      setModalPosition({
        top: shouldOpenUpwards ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
      });
      setOpenUpwards(shouldOpenUpwards);
    }

    setShowDropdown((prev) => !prev);
  };

  // Prepare gameData for PlayerProfileModal
  const gameData = startingElo !== undefined && currentElo !== undefined ? {
    startingElo: {
      [color]: startingElo
    },
    finalElo: {
      [color]: currentElo
    },
    status: eloChange !== undefined ? "ended" : "ongoing"
  } : undefined;

  return (
    <div ref={containerRef} className="relative z-[1000]">
      {/* Player card */}
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 w-full max-w-[250px] backdrop-blur-sm bg-gray-900/40 px-3 py-2 rounded-lg border border-teal-500/30 ${
          player?.uid
            ? "cursor-pointer hover:bg-gray-900/60 hover:border-teal-500/50 transition-all duration-200"
            : "opacity-60"
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="text-teal-300/60 text-xs font-medium uppercase tracking-wide mb-0.5">
            {color === "white" ? "White" : "Black"}
          </div>
          <div className="text-white font-semibold text-sm truncate">
            {player?.name ? player.name : player?.uid ? "Guest" : "Waiting..."}
          </div>
        </div>

        {player && (
          isGuest ? (
            <div className="text-slate-400 text-xs bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-600/40 flex items-center gap-1">
              🎮 Guest
            </div>
          ) : (
            <div className="text-teal-300 font-bold text-base bg-teal-500/20 px-2.5 py-1 rounded-md border border-teal-500/40 flex items-center gap-1.5">
              <span>{currentElo || player.elo || 1200}</span>
              {eloChange !== undefined && eloChange !== 0 && (
                <span className={`text-xs font-semibold ${eloChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({eloChange > 0 ? '+' : ''}{eloChange})
                </span>
              )}
            </div>
          )
        )}
      </div>

      {/* 🔹 Player Profile Modal */}
      {showDropdown && player && (
        <PlayerProfileModal
          player={player}
          gameData={gameData}
          playerColor={color}
          position={modalPosition}
          openUpwards={openUpwards}
          onClose={() => setShowDropdown(false)}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
