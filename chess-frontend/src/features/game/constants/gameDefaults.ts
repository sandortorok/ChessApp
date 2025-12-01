import type { Game } from '../types';

export const DEFAULT_GAME: Game = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Kezdő pozíció
  moves: [],
  lastMove: null,
  players: null,
  turn: 'white',
  status: 'waiting',
  winner: null,
  winReason: null,
  timeLeft: { white: 5 * 60 * 1000, black: 5 * 60 * 1000 },
  createdAt: 0,
  updatedAt: 0,
  drawOfferedBy: null,
  timeControl: 5,
  increment: 0,
  opponentType: 'human',
  startingElo: undefined,
  finalElo: undefined,
};
