/**
 * Game End Service
 * Handles game ending conditions, draw offers, surrender, and abort
 */

import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { eloService } from './eloService';
import { playerService } from '@/features/player/services/playerService';
import type { Chess } from 'chess.js';
import type {
  Game,
  GameEndInfo,
  PlayerColor,
  Status,
  TimeLeft,
  Winner,
  winReason,
} from '../types/index';

export class GameEndService {
  /**
   * Check if game should end (checkmate, stalemate, draw, timeout)
   */
  checkGameEndConditions(
    chessGame: Chess,
    gameData: Game,
    timeLeft: TimeLeft
  ): GameEndInfo {
    let status: Status = 'ongoing';
    let winner: 'white' | 'black' | 'draw' | null = null;
    let winReasonValue: winReason | null = null;
    const playerMoved = gameData.turn === 'white' ? 'black' : 'white';

    // Check timeout
    if (timeLeft[playerMoved] === 0 && gameData.status !== 'waiting') {
      status = 'ended';
      winner = playerMoved;
      winReasonValue = 'timeout';
    }

    // Check checkmate
    if (chessGame.isCheckmate()) {
      status = 'ended';
      winner = playerMoved;
      winReasonValue = 'checkmate';
    }
    // Check draw conditions
    else if (this.getDrawReason(chessGame)) {
      status = 'ended';
      winner = 'draw';
      winReasonValue = this.getDrawReason(chessGame);
    }

    return { status, winner, winReasonValue };
  }

  /**
   * Determine draw reason
   */
  getDrawReason(
    chessGame: Chess
  ):
    | 'stalemate'
    | 'threefoldRepetition'
    | 'insufficientMaterial'
    | 'draw'
    | null {
    if (chessGame.isStalemate()) return 'stalemate';
    if (chessGame.isThreefoldRepetition()) return 'threefoldRepetition';
    if (chessGame.isInsufficientMaterial()) return 'insufficientMaterial';
    if (chessGame.isDraw()) return 'draw';
    return null;
  }

  /**
   * Update Firestore and Realtime Database on game end
   */
  async finalizeGameEnd(
    gameId: string,
    gameData: Game,
    winner: Winner
  ): Promise<void> {
    const whiteUid = gameData?.players?.white?.uid;
    const blackUid = gameData?.players?.black?.uid;

    if (!winner || !whiteUid || !blackUid) {
      console.error('Missing required data for game end finalization');
      return;
    }

    try {
      // Get current ELO values
      const [whiteData, blackData] = await Promise.all([
        playerService.getPlayerData(whiteUid),
        playerService.getPlayerData(blackUid),
      ]);

      if (!whiteData || !blackData) {
        console.error('Could not fetch player data for game end');
        return;
      }

      // Update both players' ELO and stats
      const result = await eloService.updateBothPlayersElo(
        whiteUid,
        blackUid,
        winner
      );

      if (!result) {
        console.error('Failed to update player ELO');
        return;
      }

      const { whiteChange, blackChange } = result;

      // Save final ELO to game
      const finalElo = {
        white: whiteData.elo + whiteChange,
        black: blackData.elo + blackChange,
      };

      await eloService.saveFinalEloToGame(
        gameId,
        finalElo.white,
        finalElo.black
      );
    } catch (error) {
      console.error('Error finalizing game end:', error);
    }
  }

  /**
   * Handle draw offer
   */
  async offerDraw(gameId: string, userId: string): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, {
      drawOfferedBy: userId,
    });
  }

  /**
   * Accept draw offer
   */
  async acceptDraw(gameId: string, gameData: Game): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);

    await update(gameRef, {
      status: 'ended',
      winner: 'draw',
      winReason: 'aggreement',
      drawOfferedBy: null,
    });

    await this.finalizeGameEnd(gameId, gameData, 'draw');
  }

  /**
   * Decline draw offer
   */
  async declineDraw(gameId: string): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, {
      drawOfferedBy: null,
    });
  }

  /**
   * Abort game (only first 0-1 moves)
   */
  async abortGame(gameId: string): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    const now = Date.now();

    await update(gameRef, {
      status: 'ended',
      winner: 'draw',
      winReason: 'aborted',
      updatedAt: now,
    });
  }

  /**
   * Surrender game
   */
  async surrenderGame(
    gameId: string,
    gameData: Game,
    surrenderingSide: PlayerColor
  ): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    const winner = surrenderingSide === 'white' ? 'black' : 'white';

    await update(gameRef, {
      status: 'ended',
      winner,
      winReason: 'resignation',
    });

    await this.finalizeGameEnd(gameId, gameData, winner);
  }
}

// Export singleton instance
export const gameEndService = new GameEndService();
