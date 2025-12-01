import { ref, set, get, update } from 'firebase/database';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { db, firestore } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import type { Game, Players } from '@/features/game/types/index';

const DEFAULT_ELO = 1200;

/**
 * Service for managing player-related operations including joining games,
 * retrieving player data, and managing game participation.
 */
export class PlayerService {
  private static instance: PlayerService | null = null;

  private constructor() {}

  /**
   * Gets the singleton instance of PlayerService.
   */
  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  /**
   * Attempts to join a player to a game.
   * @param gameId - The ID of the game to join
   * @param user - The user attempting to join
   * @returns The side ('white' or 'black') the player joined as, or null if unable to join
   */
  async joinGame(
    gameId: string,
    user: User
  ): Promise<'white' | 'black' | null> {
    const gameSnapshot = await get(ref(db, `games/${gameId}`));
    const gameData: Game = gameSnapshot.val();

    if (!gameData) return null;

    const currentPlayers = gameData.players ?? { white: null, black: null };

    const alreadyJoined =
      currentPlayers.white?.uid === user.uid ||
      currentPlayers.black?.uid === user.uid;

    if (alreadyJoined) return null;

    let sideToJoin: 'white' | 'black';
    if (!currentPlayers.white && !currentPlayers.black) {
      sideToJoin = Math.random() < 0.5 ? 'white' : 'black';
    } else if (!currentPlayers.white) {
      sideToJoin = 'white';
    } else if (!currentPlayers.black) {
      sideToJoin = 'black';
    } else {
      return null;
    }

    const userData = await this.getPlayerData(user.uid);

    const newPlayer = {
      uid: user.uid,
      name: user.displayName || user.email,
      displayName: user.displayName,
      email: user.email,
      elo: userData?.elo ?? DEFAULT_ELO,
      wins: userData?.wins ?? 0,
      losses: userData?.losses ?? 0,
      draws: userData?.draws ?? 0,
    };

    await set(ref(db, `games/${gameId}/players/${sideToJoin}`), newPlayer);

    await update(ref(db, `games/${gameId}/startingElo`), {
      [sideToJoin]: userData?.elo ?? DEFAULT_ELO,
    });

    console.log(
      `Player ${user.displayName || user.email} joined as ${sideToJoin}`
    );

    return sideToJoin;
  }

  /**
   * Gets the side (color) a player is playing as in a game.
   * @param user - The user to check
   * @param players - The players object from the game
   * @returns The side ('white' or 'black') or null if not playing
   */
  getPlayerSide(user: User, players: Players): 'white' | 'black' | null {
    if (!user || !players) return null;

    if (players.white?.uid === user.uid) return 'white';
    if (players.black?.uid === user.uid) return 'black';
    return null;
  }

  /**
   * Checks if a user is a player in the game.
   * @param user - The user to check
   * @param gameData - The game data
   * @returns True if the user is a player, false otherwise
   */
  isPlayer(user: User, gameData: Game): boolean {
    if (!gameData.players) return false;
    return this.getPlayerSide(user, gameData.players) !== null;
  }

  /**
   * Checks if a user is a spectator in the game.
   * @param user - The user to check
   * @param gameData - The game data
   * @returns True if the user is a spectator, false otherwise
   */
  isSpectator(user: User | null, gameData: Game | null): boolean {
    if (!user || !gameData) return false;
    return !this.isPlayer(user, gameData);
  }

  /**
   * Retrieves player data from Firestore.
   * @param uid - The user ID to look up
   * @returns The player document data or null if the user doesn't exist
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
   * Checks if both players have joined the game.
   * @param gameData - The game data
   * @returns True if both white and black players are present
   */
  bothPlayersJoined(gameData: Game | null): boolean {
    if (!gameData?.players) return false;
    return !!(gameData.players.white && gameData.players.black);
  }

  /**
   * Gets the opponent's data for a given user.
   * @param user - The user whose opponent to find
   * @param gameData - The game data
   * @returns The opponent's data or null if not found
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
   * Calculates the remaining time for a player.
   * @param side - The side ('white' or 'black') to get time for
   * @param gameData - The game data
   * @returns The remaining time in milliseconds
   */
  getRemainingTime(side: 'white' | 'black', gameData: Game | null): number {
    if (!gameData || !gameData.timeLeft || !gameData.updatedAt) return 0;

    if (gameData.status === 'waiting') return gameData.timeLeft[side];

    const now = Date.now();
    const elapsed = now - gameData.updatedAt;

    if (side === gameData.turn) {
      return Math.max(0, gameData.timeLeft[side] - elapsed);
    } else {
      return gameData.timeLeft[side];
    }
  }
}

export const playerService = PlayerService.getInstance();

export default playerService;
