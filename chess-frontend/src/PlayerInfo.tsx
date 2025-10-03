interface PlayerInfoProps {
  color: "white" | "black";
  player: { uid?: string; name?: string } | null;
}

export default function PlayerInfo({ color, player }: PlayerInfoProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-[200px]">
      <span className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">
        {color === "white" ? "White" : "Black"}:{" "}
        {player?.name ? player.name : player?.uid ? "Guest" : "Waiting..."}
      </span>
    </div>
  );
}