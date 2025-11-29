import PlayerInfo from "./PlayerInfo";
import ChessClock from "./ChessClock";
import type { Player } from "../types";

interface PlayerInfoWithClockProps {
    color: "white" | "black";
    player: Player | null;
    position: "top" | "bottom";
    startingElo?: number;
    currentElo?: number;
    eloChange?: number;
    initialTime: number;
    active: boolean;
    onTimeExpired: () => void;
}

export default function PlayerInfoWithClock({
    color,
    player,
    position,
    startingElo,
    currentElo,
    eloChange,
    initialTime,
    active,
    onTimeExpired,
}: PlayerInfoWithClockProps) {
    return (
        <div className="w-full max-w-[470px] mx-auto relative backdrop-blur-xl bg-gray-900/30 rounded-xl p-3 border border-teal-500/20 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 pointer-events-none" />
            <div className="relative flex justify-start items-center gap-4 z-10">
                <PlayerInfo
                    color={color}
                    player={player}
                    position={position}
                    startingElo={startingElo}
                    currentElo={currentElo}
                    eloChange={eloChange}
                />
                <div className="ml-auto">
                    <ChessClock
                        initialTime={initialTime}
                        active={active}
                        onTimeExpired={onTimeExpired}
                    />
                </div>
            </div>
        </div>
    );
}
