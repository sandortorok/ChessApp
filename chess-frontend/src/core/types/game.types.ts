/**
 * Game-related types
 */

import type { Square, winReason } from './chess.types';
import type { Player } from './player.types';

export interface MoveHistoryType {
    from: string;
    to: string;
    san: string;
    fen: string;
    updatedAt: number;
    moveNumber: number;
    timeLeft: { white: number; black: number };
}

export type GameStatus = "waiting" | "ongoing" | "ended";

export type GameWinner = "white" | "black" | "draw";

export type Game = {
    fen: string;
    moves: MoveHistoryType[];
    lastMove: { from: Square; to: Square; san: string } | null;
    players: { white: Player; black: Player } | null;
    turn: "white" | "black";
    status: GameStatus;
    winner: GameWinner | null;
    winReason: winReason | null;
    timeLeft: { white: number; black: number };
    timeControl?: number; // In minutes
    increment?: number; // In seconds
    opponentType?: "human" | "ai"; // Opponent type
    createdAt: number;
    updatedAt: number;
    started: boolean;
    startingElo?: { white: number; black: number };
    finalElo?: { white: number; black: number };
    drawOfferedBy?: string | null; // Who offered the draw (uid)
};
