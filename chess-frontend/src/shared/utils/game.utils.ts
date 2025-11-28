/**
 * Game-related utility functions
 */

import type { Player, Game } from '../../core/types';

/**
 * Check if a player is a guest (uid starts with "guest_")
 */
export function isGuest(player: Player | null | undefined): boolean {
    return player?.uid?.startsWith("guest_") ?? false;
}

/**
 * Check if a game is full (both players have joined)
 */
export function isFull(game: Game | { players?: { white?: unknown; black?: unknown } | null }): boolean {
    return Boolean(game.players?.white && game.players?.black);
}

/**
 * Get the player's side in the game
 */
export function getPlayerSide(
    userId: string | null | undefined,
    game: Game | { players?: { white?: { uid?: string }; black?: { uid?: string } } | null }
): 'white' | 'black' | null {
    if (!userId || !game.players) return null;
    if (game.players.white?.uid === userId) return 'white';
    if (game.players.black?.uid === userId) return 'black';
    return null;
}

/**
 * Get display name for a player with fallbacks
 */
export function getPlayerDisplayName(player: Player | null | undefined): string {
    if (!player) return "Waiting";
    return player.name || player.displayName || player.email?.split('@')[0] || (player.uid ? "Guest" : "Waiting");
}
