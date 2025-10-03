// PlayerInfo.tsx
export default function PlayerInfo({ color, player }: { color: "white" | "black"; player?: any | null }) {
  return (
    <div className="text-lg font-semibold text-white">
      {color === "white" ? "White" : "Black"}: {player?.name || (player?.uid ? player.uid : "Waiting...")}
    </div>
  );
}
