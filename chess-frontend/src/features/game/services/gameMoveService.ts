/**
 * Service for processing chess moves and synchronizing game state with Firebase
 * Handles move validation, game state updates, and end-game detection
 */

import { ref, update, get } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { gameTimerService } from './gameTimerService';
import { gameEndService } from './gameEndService';
import type { Chess, Move } from 'chess.js';
import type { Game, MoveHistoryType } from '../types/index';

export class GameMoveService {
  private static instance: GameMoveService | null = null;

  private constructor() {}

  public static getInstance(): GameMoveService {
    if (!GameMoveService.instance) {
      GameMoveService.instance = new GameMoveService();
    }
    return GameMoveService.instance;
  }
  /**
   * Executes a chess move using chess.js library
   * @param chessGame - Chess.js instance
   * @param sourceSquare - Starting square in algebraic notation (e.g., 'e2')
   * @param targetSquare - Target square in algebraic notation (e.g., 'e4')
   * @returns Move object if valid, null if invalid
   */
  move(
    chessGame: Chess,
    sourceSquare: string,
    targetSquare: string
  ): Move | null {
    const move = chessGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (!move) return null;
    return move;
  }

  /**
   * Creates a move history entry with position and timing information
   */
  private createMoveHistoryElement(
    gameData: Game,
    move: Move,
    fen: string,
    timeLeft: { white: number; black: number }
  ): MoveHistoryType {
    const currentMoves = gameData?.moves || [];
    const moveNumber = Math.floor(currentMoves.length / 2) + 1;

    return {
      from: move.from,
      to: move.to,
      san: move.san,
      fen,
      updatedAt: Date.now(),
      moveNumber: moveNumber,
      timeLeft,
    };
  }

  /**
   * Builds the update payload for Firebase with all changed game properties
   */
  private buildUpdatePayload(
    fen: string,
    move: Move,
    gameEndInfo: {
      status: Game['status'];
      winner: Game['winner'];
      winReasonValue: Game['winReason'];
    },
    newTimeLeft: { white: number; black: number },
    newMove: MoveHistoryType,
    currentMoves: MoveHistoryType[],
    nextTurn: 'white' | 'black'
  ): Partial<Game> {
    return {
      fen,
      lastMove: {
        from: move.from,
        to: move.to,
        san: move.san,
      },
      updatedAt: Date.now(),
      status: gameEndInfo.status,
      winner: gameEndInfo.winner,
      moves: [...currentMoves, newMove],
      timeLeft: newTimeLeft,
      winReason: gameEndInfo.winReasonValue,
      turn: nextTurn,
    };
  }

  /**
   * Updates game state in Firebase after a move is executed
   * Calculates time remaining, checks for game-ending conditions, and finalizes if needed
   * @param gameId - Unique game identifier
   * @param gameData - Current game state
   * @param chessGame - Chess.js instance with the new position
   * @param newFen - FEN string of the new position
   * @param move - Move object from chess.js
   */
  async updateGameInDb(
    gameId: string,
    gameData: Game,
    chessGame: Chess,
    newFen: string,
    move: Move
  ): Promise<void> {
    // chess.js turn() returns the next player to move, so we invert to get who just moved
    const currentTurn = chessGame.turn();
    console.log('chessGame.turn():', currentTurn, 'type:', typeof currentTurn);
    const playerWhoMoved = currentTurn === 'w' ? 'black' : 'white';
    const nextTurn = currentTurn === 'w' ? 'white' : 'black';

    const newTimeLeft = gameTimerService.calculateTimeLeft(
      gameData,
      playerWhoMoved
    );
    const gameEndInfo = gameEndService.checkGameEndConditions(
      chessGame,
      gameData,
      newTimeLeft
    );

    const newMove = this.createMoveHistoryElement(
      gameData,
      move,
      newFen,
      newTimeLeft
    );

    const currentMoves = gameData?.moves || [];
    const updateData = this.buildUpdatePayload(
      newFen,
      move,
      gameEndInfo,
      newTimeLeft,
      newMove,
      currentMoves,
      nextTurn
    );

    try {
      await update(ref(db, `games/${gameId}`), updateData);

      if (gameEndInfo.status === 'ended' && gameEndInfo.winner) {
        await gameEndService.finalizeGameEnd(
          gameId,
          gameData,
          gameEndInfo.winner
        );
      }
    } catch (error) {
      console.error(`Failed to update game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a game exists in the database
   * @param gameId - Unique game identifier
   * @returns True if game exists, false otherwise
   */
  async gameExists(gameId: string): Promise<boolean> {
    const gameRef = ref(db, `games/${gameId}`);
    const snap = await get(gameRef);
    return snap.exists();
  }
}

export const gameMoveService = GameMoveService.getInstance();
