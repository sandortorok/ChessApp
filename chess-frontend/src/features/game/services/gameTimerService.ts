/**
 * Game Timer Service
 * Handles time calculations and timeout logic
 */

import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import type { Game, PlayerColor, TimeLeft } from '../types/index';

export class GameTimerService {
  private static instance: GameTimerService | null = null;

  private constructor() {}

  public static getInstance(): GameTimerService {
    if (!GameTimerService.instance) {
      GameTimerService.instance = new GameTimerService();
    }
    return GameTimerService.instance;
  }
  /**
   * Calculate time left after a move
   */
  calculateTimeLeft(gameData: Game, playerWhoMoved: PlayerColor): TimeLeft {
    const now = Date.now();
    const lastUpdate = gameData.updatedAt || now;
    const elapsed = gameData.status !== 'waiting' ? now - lastUpdate : 0;
    const newTimeLeft: TimeLeft = { ...gameData.timeLeft };

    // Subtract elapsed time from the player who just moved
    if (gameData.status !== 'waiting') {
      newTimeLeft[playerWhoMoved] = Math.max(
        0,
        newTimeLeft[playerWhoMoved] - elapsed
      );
      const incrementMs = (gameData.increment || 0) * 1000;
      newTimeLeft[playerWhoMoved] += incrementMs;
    }

    return newTimeLeft;
  }

  /**
   * Handle timeout - set time to 0 and end game
   */
  async handleTimeout(
    gameId: string,
    gameData: Game,
    timeoutSide: PlayerColor
  ): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    const winner = timeoutSide === 'white' ? 'black' : 'white';

    // Set timeout player's time to 0
    const updatedTimeLeft = { ...gameData.timeLeft };
    updatedTimeLeft[timeoutSide] = 0;

    await update(gameRef, {
      status: 'ended',
      winner,
      winReason: 'timeout',
      timeLeft: updatedTimeLeft,
    });
  }
}

// Export singleton instance
export const gameTimerService = GameTimerService.getInstance();
