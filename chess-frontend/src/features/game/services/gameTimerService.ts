/**
 * Service for managing game timers and time-related game logic
 * Handles time calculations, increments, and timeout detection
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
   * Calculates remaining time for both players after a move
   * Applies time increment if configured
   * @param gameData - Current game state
   * @param playerWhoMoved - Color of the player who just moved
   * @returns Updated time remaining for both players
   */
  calculateTimeLeft(gameData: Game, playerWhoMoved: PlayerColor): TimeLeft {
    const now = Date.now();
    const lastUpdate = gameData.updatedAt || now;
    const elapsed = gameData.status !== 'waiting' ? now - lastUpdate : 0;
    const newTimeLeft: TimeLeft = { ...gameData.timeLeft };

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
   * Handles a timeout condition by ending the game
   * @param gameId - Unique game identifier
   * @param gameData - Current game state
   * @param timeoutSide - Color of the player who ran out of time
   */
  async handleTimeout(
    gameId: string,
    gameData: Game,
    timeoutSide: PlayerColor
  ): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    const winner = timeoutSide === 'white' ? 'black' : 'white';

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

export const gameTimerService = GameTimerService.getInstance();
