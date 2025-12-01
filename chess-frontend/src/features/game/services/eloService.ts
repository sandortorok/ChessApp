/**
 * ELO Service
 * Handles ELO calculations and Firestore updates
 */

import { doc, updateDoc, increment } from 'firebase/firestore';
import { ref, update } from 'firebase/database';
import { db, firestore } from '@/lib/firebase/config';
import { playerService } from '@/features/player/services/playerService';
import type { Winner } from '../types/index';

export class EloService {
  /**
   * Calculate ELO change based on game outcome
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

    // winner === "black"
    const whiteChange = Math.round(K * (0 - expectedWhite));
    const blackChange = Math.round(K * (1 - expectedBlack));
    return { whiteChange, blackChange };
  }

  /**
   * Update player stats in Firestore after game end
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
   * Update both players' ELO and stats in Firestore
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
   * Save final ELO to game in Realtime Database
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
   * Save starting ELO when both players joined
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

// Export singleton instance
export const eloService = new EloService();
