/** Guest players have UIDs starting with "guest_" */
export function isGuest(player: any): boolean {
  return player?.uid?.startsWith('guest_');
}

/** Formats timestamp as "5m ago", "3h ago", "2d ago" */
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

/** Fallback chain: name → displayName → email → "Guest" → "Waiting" */
export function getPlayerDisplayName(player: any): string {
  if (!player) return 'Waiting';
  return (
    player.name ||
    player.displayName ||
    player.email?.split('@')[0] ||
    (player.uid ? 'Guest' : 'Waiting')
  );
}

/** Priority: finalElo → startingElo → player.elo → 1200 */
export function getPlayerElo(
  player: any,
  gameData?: any,
  playerColor?: 'white' | 'black'
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

/** Returns null if game not ended or ELO data missing */
export function getEloChange(
  gameData: any,
  playerColor: 'white' | 'black'
): number | null {
  if (
    !gameData?.finalElo?.[playerColor] ||
    !gameData?.startingElo?.[playerColor]
  ) {
    return null;
  }
  return gameData.finalElo[playerColor] - gameData.startingElo[playerColor];
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'waiting':
      return 'bg-amber-100 text-amber-700';
    case 'ongoing':
      return 'bg-emerald-100 text-emerald-700';
    case 'ended':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'waiting':
      return '⏳ Waiting';
    case 'ongoing':
      return '▶ Ongoing';
    case 'ended':
      return '✔ Ended';
    default:
      return '❓ Unknown';
  }
}

export function isGameFull(game: any): boolean {
  return !!(game.players?.white && game.players?.black);
}
