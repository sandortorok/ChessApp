/**
 * Settings-related types
 */

export interface GameSettings {
    timeControl: number; // In minutes
    increment: number; // In seconds
    opponentType: "human" | "ai";
}

export interface UserSettings {
    displayName: string | null;
    email: string | null;
    avatar?: string;
    boardTheme?: string;
    soundEnabled?: boolean;
    volume?: number;
}
