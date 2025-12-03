/**
 * Service for managing game termination scenarios
 * Handles checkmate, stalemate, draws, timeouts, resignations, and aborts
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
  private static instance: GameEndService | null = null;

  private constructor() {}

  public static getInstance(): GameEndService {
    if (!GameEndService.instance) {
      GameEndService.instance = new GameEndService();
    }
    return GameEndService.instance;
  }
  /**
   * Checks if the game has reached an ending condition
   * @param chessGame - Chess.js instance
   * @param gameData - Current game state
   * @param timeLeft - Remaining time for both players
   * @returns Object with game status, winner, and reason for ending
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

    // Check if player who just moved ran out of time (they lose)
    if (timeLeft[playerMoved] === 0 && gameData.status !== 'waiting') {
      status = 'ended';
      winner = playerMoved === 'white' ? 'black' : 'white'; // Opponent wins
      winReasonValue = 'timeout';
    }

    if (chessGame.isCheckmate()) {
      status = 'ended';
      winner = playerMoved;
      winReasonValue = 'checkmate';
    } else if (this.getDrawReason(chessGame)) {
      status = 'ended';
      winner = 'draw';
      winReasonValue = this.getDrawReason(chessGame);
    }

    return { status, winner, winReasonValue };
  }

  /**
   * Determines the specific reason for a draw if applicable
   * @param chessGame - Chess.js instance
   * @returns Specific draw reason or null if not a draw
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
   * Finalizes a game by updating player statistics and ELO ratings
   * @param gameId - Unique game identifier
   * @param gameData - Current game state
   * @param winner - Game result: 'white', 'black', or 'draw'
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
      const [whiteData, blackData] = await Promise.all([
        playerService.getPlayerData(whiteUid),
        playerService.getPlayerData(blackUid),
      ]);

      if (!whiteData || !blackData) {
        console.error('Could not fetch player data for game end');
        return;
      }

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
   * Sends a draw offer from one player to their opponent
   * @param gameId - Unique game identifier
   * @param userId - User ID of the player offering the draw
   */
  async offerDraw(gameId: string, userId: string): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, {
      drawOfferedBy: userId,
    });
  }

  /**
   * Accepts a draw offer and ends the game as a draw
   * @param gameId - Unique game identifier
   * @param gameData - Current game state
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
   * Declines a draw offer and continues the game
   * @param gameId - Unique game identifier
   */
  async declineDraw(gameId: string): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, {
      drawOfferedBy: null,
    });
  }

  /**
   * Aborts a game without affecting player statistics
   * Should only be used in the first few moves
   * @param gameId - Unique game identifier
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
   * Handles a player's surrender (resignation)
   * @param gameId - Unique game identifier
   * @param gameData - Current game state
   * @param surrenderingSide - Color of the player who is surrendering
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

export const gameEndService = GameEndService.getInstance();
