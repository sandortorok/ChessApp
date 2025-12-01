import type { Player } from '@/features/player';

export type { Player };

/** Chess square in algebraic notation (e.g., "e4", "a1") */
export type Square =
  | 'a1'
  | 'a2'
  | 'a3'
  | 'a4'
  | 'a5'
  | 'a6'
  | 'a7'
  | 'a8'
  | 'b1'
  | 'b2'
  | 'b3'
  | 'b4'
  | 'b5'
  | 'b6'
  | 'b7'
  | 'b8'
  | 'c1'
  | 'c2'
  | 'c3'
  | 'c4'
  | 'c5'
  | 'c6'
  | 'c7'
  | 'c8'
  | 'd1'
  | 'd2'
  | 'd3'
  | 'd4'
  | 'd5'
  | 'd6'
  | 'd7'
  | 'd8'
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'g1'
  | 'g2'
  | 'g3'
  | 'g4'
  | 'g5'
  | 'g6'
  | 'g7'
  | 'g8'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'h7'
  | 'h8';

export type winReason =
  | 'checkmate'
  | 'timeout'
  | 'stalemate'
  | 'threefoldRepetition'
  | 'insufficientMaterial'
  | 'draw'
  | 'resignation'
  | 'aggreement' // TODO: Fix typo → "agreement"
  | 'aborted';

export interface MoveHistoryType {
  from: string;
  to: string;
  san: string;
  fen: string;
  updatedAt: number;
  moveNumber: number;
  timeLeft: TimeLeft;
}

/** Game state synced via Firebase Realtime Database */
export type Game = {
  fen: string;
  moves: MoveHistoryType[];
  lastMove: { from: Square; to: Square; san: string } | null;
  players: Players | null;
  turn: PlayerColor;
  status: Status;
  winner: Winner;
  winReason: winReason | null;
  timeLeft: TimeLeft;
  timeControl: number;
  increment: number;
  opponentType: 'human' | 'ai';
  createdAt: number;
  updatedAt: number;
  startingElo?: PlayerElos;
  finalElo?: PlayerElos;
  drawOfferedBy?: string | null;
};
export type GameEndInfo = {
  status: Status;
  winner: Winner | null;
  winReasonValue: winReason | null;
};
export type TimeLeft = { white: number; black: number };
export type PlayerElos = { white: number; black: number };
export type Winner = 'white' | 'black' | 'draw' | null;
export type PlayerColor = 'white' | 'black';
export type Players = { white: Player; black: Player };
export type Status = 'waiting' | 'ongoing' | 'ended';
