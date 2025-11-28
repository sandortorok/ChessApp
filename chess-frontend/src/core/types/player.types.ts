/**
 * Player-related types
 */

export type Player = {
    uid: string;
    name?: string; // Used by PlayerInfo component
    displayName: string | null;
    email: string | null;
    elo: number;
    wins: number;
    losses: number;
    draws: number;
};
