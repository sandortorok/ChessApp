import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if player is guest
  const isGuest = player?.uid?.startsWith("guest_");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!player?.uid) return;

    // Csak a felső játékoshoz kell a portálos pozíció
    if (position === "top" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8, // lefelé
        left: rect.left,
        zIndex: 9999,
      });
    }

    setShowDropdown((prev) => !prev);
  };

  // Bezárja a dropdown-t, ha máshova kattintasz
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // 🔹 Dropdown tartalom külön komponensként
  const Dropdown = (
    <div
      className={`backdrop-blur-xl bg-gray-900/95 border border-teal-500/50 rounded-xl shadow-2xl p-4 min-w-[280px] animate-slideDown`}
      style={position === "top" ? dropdownStyle : {}}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30 flex items-center justify-center text-2xl border border-teal-500/50">
            {isGuest ? "🎮" : "👤"}
          </div>
          <div>
            <p className="text-white font-semibold">{player?.name || "Guest"}</p>
            {!isGuest && (
              <div className="flex items-center gap-2">
                <p className="text-teal-400 text-sm font-medium">
                  ELO: {currentElo || player?.elo || 1200}
                </p>
                {eloChange !== undefined && eloChange !== 0 && (
                  <span className={`text-xs font-bold ${eloChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({eloChange > 0 ? '+' : ''}{eloChange})
                  </span>
                )}
              </div>
            )}
            {isGuest && (
              <p className="text-slate-400 text-sm">🎮 Guest Player</p>
            )}
          </div>
        </div>

        <div className="border-t border-teal-500/30 pt-3 space-y-2">
          {startingElo !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-teal-300/70">Starting ELO:</span>
              <span className="text-white font-semibold">{startingElo}</span>
            </div>
          )}
          {currentElo !== undefined && startingElo !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-teal-300/70">Current ELO:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{currentElo}</span>
                {eloChange !== undefined && eloChange !== 0 && (
                  <span className={`text-xs font-bold ${eloChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({eloChange > 0 ? '+' : ''}{eloChange})
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-teal-300/70">User ID:</span>
            <span className="text-white font-mono text-xs">
              {player?.uid?.slice(0, 8) || "N/A"}
            </span>
          </div>
          {player?.wins !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-teal-300/70">Wins:</span>
              <span className="text-white font-semibold">{player.wins || 0}</span>
            </div>
          )}
          {player?.losses !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-teal-300/70">Losses:</span>
              <span className="text-white font-semibold">{player.losses || 0}</span>
            </div>
          )}
          {player?.wins !== undefined && player?.losses !== undefined && (
            <div className="flex justify-between text-sm pt-2 border-t border-teal-500/20">
              <span className="text-teal-300/70">Win Rate:</span>
              <span className="text-teal-400 font-semibold">
                {player.wins + player.losses > 0
                  ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%`
                  : "N/A"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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

      {/* 🔹 Felső játékos → PORTÁLBA renderelt dropdown */}
      {showDropdown &&
        position === "top" &&
        player &&
        createPortal(Dropdown, document.body)}

      {/* 🔹 Alsó játékos → normál lokális dropdown */}
      {showDropdown && position === "bottom" && player && (
        <div
          className={`absolute left-0 bottom-full mb-2 z-[2000]`}
        >
          {Dropdown}
        </div>
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
