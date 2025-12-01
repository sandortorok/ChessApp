/**
 * Service for calculating ELO ratings and updating player statistics
 * Implements the standard ELO rating system with K-factor of 32
 */

import { doc, updateDoc, increment } from 'firebase/firestore';
import { ref, update } from 'firebase/database';
import { db, firestore } from '@/lib/firebase/config';
import { playerService } from '@/features/player/services/playerService';
import type { Winner } from '../types/index';

export class EloService {
  private static instance: EloService | null = null;

  private constructor() {}

  public static getInstance(): EloService {
    if (!EloService.instance) {
      EloService.instance = new EloService();
    }
    return EloService.instance;
  }
  /**
   * Calculates ELO rating changes for both players based on game outcome
   * @param whiteElo - Current ELO rating of white player
   * @param blackElo - Current ELO rating of black player
   * @param winner - Game result: 'white', 'black', or 'draw'
   * @returns Object containing ELO changes for both players
   */
  calculateEloChange(
    whiteElo: number,
    blackElo: number,
    winner: Winner
  ): { whiteChange: number; blackChange: number } {
    const K = 32;
    const expectedWhite = 1 / (1 + Math.pow(10, (blackElo - whiteElo) / 400));
    const expectedBlack = 1 / (1 + Math.pow(10, (whiteElo - blackElo) / 400));

    if (winner === 'draw') {
      const whiteChange = Math.round(K * (0.5 - expectedWhite));
      const blackChange = Math.round(K * (0.5 - expectedBlack));
      return { whiteChange, blackChange };
    }

    if (winner === 'white') {
      const whiteChange = Math.round(K * (1 - expectedWhite));
      const blackChange = Math.round(K * (0 - expectedBlack));
      return { whiteChange, blackChange };
    }

    const whiteChange = Math.round(K * (0 - expectedWhite));
    const blackChange = Math.round(K * (1 - expectedBlack));
    return { whiteChange, blackChange };
  }

  /**
   * Updates player statistics in Firestore after a game ends
   * @param uid - User ID of the player
   * @param isWinner - Whether the player won the game
   * @param isDraw - Whether the game ended in a draw
   * @param eloChange - ELO rating change (can be positive or negative)
   */
  async updatePlayerStats(
    uid: string,
    isWinner: boolean,
    isDraw: boolean,
    eloChange: number
  ): Promise<void> {
    const playerRef = doc(firestore, 'users', uid);

    if (isDraw) {
      await updateDoc(playerRef, {
        draws: increment(1),
        elo: increment(eloChange),
      });
    } else if (isWinner) {
      await updateDoc(playerRef, {
        wins: increment(1),
        elo: increment(eloChange),
      });
    } else {
      await updateDoc(playerRef, {
        losses: increment(1),
        elo: increment(eloChange),
      });
    }
  }

  /**
   * Updates ELO ratings and statistics for both players after a game
   * @param whiteUid - User ID of white player
   * @param blackUid - User ID of black player
   * @param winner - Game result: 'white', 'black', or 'draw'
   * @returns Object with ELO changes or null if player data unavailable
   */
  async updateBothPlayersElo(
    whiteUid: string,
    blackUid: string,
    winner: Winner
  ): Promise<{ whiteChange: number; blackChange: number } | null> {
    try {
      const [whiteData, blackData] = await Promise.all([
        playerService.getPlayerData(whiteUid),
        playerService.getPlayerData(blackUid),
      ]);

      if (!whiteData || !blackData) {
        console.error('Could not fetch player data for ELO calculation');
        return null;
      }

      const { whiteChange, blackChange } = this.calculateEloChange(
        whiteData.elo,
        blackData.elo,
        winner
      );

      await Promise.all([
        this.updatePlayerStats(
          whiteUid,
          winner === 'white',
          winner === 'draw',
          whiteChange
        ),
        this.updatePlayerStats(
          blackUid,
          winner === 'black',
          winner === 'draw',
          blackChange
        ),
      ]);

      return { whiteChange, blackChange };
    } catch (error) {
      console.error('Error updating player ELO:', error);
      return null;
    }
  }

  /**
   * Saves final ELO ratings to the game record in Realtime Database
   * @param gameId - Unique game identifier
   * @param whiteElo - Final ELO rating of white player
   * @param blackElo - Final ELO rating of black player
   */
  async saveFinalEloToGame(
    gameId: string,
    whiteElo: number,
    blackElo: number
  ): Promise<void> {
    try {
      const gameRef = ref(db, `games/${gameId}`);
      await update(gameRef, {
        finalElo: {
          white: whiteElo,
          black: blackElo,
        },
      });
    } catch (error) {
      console.error('Error saving final ELO to game:', error);
    }
  }

  /**
   * Saves starting ELO ratings when both players have joined the game
   * @param gameId - Unique game identifier
   * @param whiteUid - User ID of white player
   * @param blackUid - User ID of black player
   */
  async saveStartingElo(
    gameId: string,
    whiteUid: string,
    blackUid: string
  ): Promise<void> {
    try {
      const whiteData = await playerService.getPlayerData(whiteUid);
      const blackData = await playerService.getPlayerData(blackUid);

      if (!whiteData || !blackData) {
        console.error('Could not fetch player data for starting ELO');
        return;
      }

      const gameRef = ref(db, `games/${gameId}`);
      await update(gameRef, {
        startingElo: { white: whiteData.elo, black: blackData.elo },
      });

      console.log('Starting ELO saved:', {
        white: whiteData.elo,
        black: blackData.elo,
      });
    } catch (error) {
      console.error('Error saving starting ELO:', error);
    }
  }
}

export const eloService = EloService.getInstance();
