import type { Game } from "../types";

export const DEFAULT_GAME: Game = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Kezdő pozíció
  moves: [],
  lastMove: null,
  players: null,
  turn: 'white',
  status: 'waiting',
  winner: null,
  winReason: null,
  timeLeft: { white: 0, black: 0 },
  createdAt: 0,
  updatedAt: 0,
  drawOfferedBy: null,
  timeControl: 0,
  increment: 0,
  opponentType: undefined,
  startingElo: undefined,
  finalElo: undefined
};