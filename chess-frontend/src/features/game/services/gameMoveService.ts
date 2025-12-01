/**
 * Game Move Service
 * Handles chess moves and game state updates
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
   * Execute a chess move
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
   * Create a new move history element
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
   * Build update payload for Firebase
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
    currentMoves: MoveHistoryType[]
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
    };
  }

  /**
   * Update game state in Firebase after a move
   */
  async updateGameInDb(
    gameId: string,
    gameData: Game,
    chessGame: Chess,
    newFen: string,
    move: Move
  ): Promise<void> {
    // chessGame.turn() returns the NEXT player (after the move)
    // So the player who just moved is the opposite
    const playerWhoMoved = chessGame.turn() === 'w' ? 'black' : 'white';

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
      currentMoves
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
   * Check if game exists in database
   */
  async gameExists(gameId: string): Promise<boolean> {
    const gameRef = ref(db, `games/${gameId}`);
    const snap = await get(gameRef);
    return snap.exists();
  }
}

// Export singleton instance
export const gameMoveService = GameMoveService.getInstance();
