import PodiumCard from "./PodiumCard";

interface Player {
    name?: string;
    elo: number;
    wins: number;
    losses: number;
}

interface PodiumProps {
    players: Player[];
}

export default function Podium({ players }: PodiumProps) {
    if (players.length < 3) return null;

    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            <PodiumCard player={players[1]} rank={2} />
            <PodiumCard player={players[0]} rank={1} />
            <PodiumCard player={players[2]} rank={3} />
        </div>
    );
}
