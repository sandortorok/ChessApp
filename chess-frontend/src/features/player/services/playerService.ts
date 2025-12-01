/**
 * Player Service
 * Handles player-related operations (joining games, user data)
 */

import { ref, set, get, update } from 'firebase/database';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { db, firestore } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import type { Game, Players } from '@/features/game/types/index';

// Constants
const DEFAULT_ELO = 1200;

export class PlayerService {
  private static instance: PlayerService | null = null;

  private constructor() {}

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }
  /**
   * Join a game as a player
   */
  async joinGame(
    gameId: string,
    user: User
  ): Promise<'white' | 'black' | null> {
    // Lekérdezi a gameData-t
    const gameSnapshot = await get(ref(db, `games/${gameId}`));
    const gameData: Game = gameSnapshot.val();

    if (!gameData) return null;

    const currentPlayers = gameData.players ?? { white: null, black: null };

    // Check if already joined
    const alreadyJoined =
      currentPlayers.white?.uid === user.uid ||
      currentPlayers.black?.uid === user.uid;

    if (alreadyJoined) return null;
    // Determine which side to join
    let sideToJoin: 'white' | 'black';
    if (!currentPlayers.white && !currentPlayers.black) {
      sideToJoin = Math.random() < 0.5 ? 'white' : 'black';
    } else if (!currentPlayers.white) {
      sideToJoin = 'white';
    } else if (!currentPlayers.black) {
      sideToJoin = 'black';
    } else {
      return null; // Game is full
    }

    // Get player data from Firestore
    const userData = await this.getPlayerData(user.uid);

    const newPlayer = {
      uid: user.uid,
      name: user.displayName || user.email, // Ezt használja a PlayerInfo komponens
      displayName: user.displayName,
      email: user.email,
      elo: userData?.elo ?? DEFAULT_ELO,
      wins: userData?.wins ?? 0,
      losses: userData?.losses ?? 0,
      draws: userData?.draws ?? 0,
    };

    await set(ref(db, `games/${gameId}/players/${sideToJoin}`), newPlayer);

    // Save starting ELO for this player
    await update(ref(db, `games/${gameId}/startingElo`), {
      [sideToJoin]: userData?.elo ?? DEFAULT_ELO,
    });

    console.log(
      `Player ${user.displayName || user.email} joined as ${sideToJoin}`
    );

    return sideToJoin;
  }

  /**
   * Get player's side in a game
   */
  getPlayerSide(user: User, players: Players): 'white' | 'black' | null {
    if (!user || !players) return null;

    if (players.white?.uid === user.uid) return 'white';
    if (players.black?.uid === user.uid) return 'black';
    return null;
  }

  /**
   * Check if user is a player in the game
   */
  isPlayer(user: User, gameData: Game): boolean {
    if (!gameData.players) return false;
    return this.getPlayerSide(user, gameData.players) !== null;
  }

  /**
   * Check if user is a spectator
   */
  isSpectator(user: User | null, gameData: Game | null): boolean {
    if (!user || !gameData) return false;
    return !this.isPlayer(user, gameData);
  }

  /**
   * Get player data from Firestore
   * Returns player document data or null if user doesn't exist
   */
  async getPlayerData(uid: string): Promise<DocumentData | null> {
    const playerRef = doc(firestore, 'users', uid);
    const playerDoc = await getDoc(playerRef);
    if (playerDoc.exists()) {
      return playerDoc.data();
    } else {
      return null;
    }
  }

  /**
   * Check if both players have joined
   */
  bothPlayersJoined(gameData: Game | null): boolean {
    if (!gameData?.players) return false;
    return !!(gameData.players.white && gameData.players.black);
  }

  /**
   * Get opponent data
   */
  getOpponent(
    user: User | null,
    gameData: Game | null
  ): {
    uid: string;
    displayName: string | null;
    email: string | null;
    elo: number;
  } | null {
    if (!user || !gameData?.players) return null;

    const mySide = this.getPlayerSide(user, gameData.players);
    if (!mySide) return null;

    const opponentSide = mySide === 'white' ? 'black' : 'white';
    return gameData.players[opponentSide] || null;
  }

  /**
   * Get player's remaining time
   */
  getRemainingTime(side: 'white' | 'black', gameData: Game | null): number {
    if (!gameData || !gameData.timeLeft || !gameData.updatedAt) return 0;

    // If game hasn't started, return initial time
    if (gameData.status === 'waiting') return gameData.timeLeft[side];

    const now = Date.now();
    const elapsed = now - gameData.updatedAt;

    // Only decrease time for the current turn player
    if (side === gameData.turn) {
      return Math.max(0, gameData.timeLeft[side] - elapsed);
    } else {
      return gameData.timeLeft[side];
    }
  }
}

// Export singleton instance
export const playerService = PlayerService.getInstance();

export default playerService;
