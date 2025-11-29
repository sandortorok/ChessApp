import { GameCard } from "@/shared/components/game/GameCard";

interface GamesGridProps {
    games: any[];
    currentUserId?: string;
    onPlayerClick?: (event: React.MouseEvent, player: any, game: any, playerColor: "white" | "black") => void;
    onGameClick?: (gameId: string) => void;
    showJoinButton?: boolean;
    showStatus?: boolean;
    showTimeControl?: boolean;
    showResult?: boolean;
}

export function GamesGrid({
    games,
    currentUserId,
    onPlayerClick,
    onGameClick,
    showJoinButton,
    showStatus,
    showTimeControl,
    showResult,
}: GamesGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
                <GameCard
                    key={game.id}
                    game={game}
                    currentUserId={currentUserId}
                    onPlayerClick={onPlayerClick}
                    onCardClick={onGameClick}
                    showJoinButton={showJoinButton}
                    showStatus={showStatus}
                    showTimeControl={showTimeControl}
                    showResult={showResult}
                />
            ))}
        </div>
    );
}
