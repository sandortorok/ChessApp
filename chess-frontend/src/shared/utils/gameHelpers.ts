/**
 * Check if a player is a guest (uid starts with "guest_")
 */
export function isGuest(player: any): boolean {
    return player?.uid?.startsWith("guest_");
}

/**
 * Format timestamp to relative time (e.g., "5m ago", "3h ago")
 */
export function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
}

/**
 * Get player display name with fallbacks
 */
export function getPlayerDisplayName(player: any): string {
    if (!player) return "Waiting";
    return (
        player.name ||
        player.displayName ||
        player.email?.split("@")[0] ||
        (player.uid ? "Guest" : "Waiting")
    );
}

/**
 * Get player ELO rating
 */
export function getPlayerElo(
    player: any,
    gameData?: any,
    playerColor?: "white" | "black"
): number {
    if (!player) return 1200;
    if (gameData?.finalElo?.[playerColor!]) {
        return gameData.finalElo[playerColor!];
    }
    if (gameData?.startingElo?.[playerColor!]) {
        return gameData.startingElo[playerColor!];
    }
    return player.elo || 1200;
}

/**
 * Calculate ELO change for a player
 */
export function getEloChange(
    gameData: any,
    playerColor: "white" | "black"
): number | null {
    if (
        !gameData?.finalElo?.[playerColor] ||
        !gameData?.startingElo?.[playerColor]
    ) {
        return null;
    }
    return gameData.finalElo[playerColor] - gameData.startingElo[playerColor];
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: string): string {
    switch (status) {
        case "waiting":
            return "bg-amber-100 text-amber-700";
        case "ongoing":
            return "bg-emerald-100 text-emerald-700";
        case "ended":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

/**
 * Get status badge label
 */
export function getStatusLabel(status: string): string {
    switch (status) {
        case "waiting":
            return "⏳ Waiting";
        case "ongoing":
            return "▶ Ongoing";
        case "ended":
            return "✔ Ended";
        default:
            return "❓ Unknown";
    }
}

/**
 * Check if game is full (both players joined)
 */
export function isGameFull(game: any): boolean {
    return !!(game.players?.white && game.players?.black);
}
