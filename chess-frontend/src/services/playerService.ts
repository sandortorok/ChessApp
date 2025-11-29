/**
 * Player Service
 * Handles player-related operations (joining games, user data)
 */

import { ref, set, get, update } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { db, firestore } from "../firebase/config";
import type { User } from "firebase/auth";
import type { Game } from "../types";

// Constants
const DEFAULT_ELO = 1200;
const DEFAULT_STATS = { elo: DEFAULT_ELO, wins: 0, losses: 0, draws: 0 };

// Types
interface PlayerStats {
  elo: number;
  wins: number;
  losses: number;
  draws: number;
}

// Helper functions
function createDefaultStats(): PlayerStats {
  return { ...DEFAULT_STATS };
}

function parsePlayerStats(data: any): PlayerStats {
  return {
    elo: data?.elo ?? DEFAULT_ELO,
    wins: data?.wins ?? 0,
    losses: data?.losses ?? 0,
    draws: data?.draws ?? 0,
  };
}

async function fetchUserDocument(userId: string) {
  return await getDoc(doc(firestore, "users", userId));
}

export class PlayerService {
  /**
   * Join a game as a player
   */
  async joinGame(
    gameId: string,
    user: User
  ): Promise<"white" | "black" | null> {
    // Lekérdezi a gameData-t
    const gameSnapshot = await get(ref(db, `games/${gameId}`));
    const gameData: Game = gameSnapshot.val();

    if (!gameData) return null;

    const currentPlayers = gameData.players ?? { white: null, black: null };

    // Check if already joined
    const alreadyJoined =
      currentPlayers.white?.uid === user.uid ||
      currentPlayers.black?.uid === user.uid;

    if (alreadyJoined) {
      return null;
    }

    // Determine which side to join
    let sideToJoin: "white" | "black";
    if (!currentPlayers.white && !currentPlayers.black) {
      sideToJoin = Math.random() < 0.5 ? "white" : "black";
    } else if (!currentPlayers.white) {
      sideToJoin = "white";
    } else if (!currentPlayers.black) {
      sideToJoin = "black";
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
      ...userData,
    };

    await set(ref(db, `games/${gameId}/players/${sideToJoin}`), newPlayer);

    // Save starting ELO for this player
    await update(ref(db, `games/${gameId}/startingElo`), {
      [sideToJoin]: userData.elo
    });

    console.log(`Player ${user.displayName || user.email} joined as ${sideToJoin}`);

    return sideToJoin;
  }

  /**
   * Get player's side in a game
   */
  getPlayerSide(user: User | null, gameData: Game | null): "white" | "black" | null {
    if (!user || !gameData?.players) return null;

    if (gameData.players.white?.uid === user.uid) return "white";
    if (gameData.players.black?.uid === user.uid) return "black";

    return null;
  }

  /**
   * Check if user is a player in the game
   */
  isPlayer(user: User | null, gameData: Game | null): boolean {
    return this.getPlayerSide(user, gameData) !== null;
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
   * Returns default stats if user doesn't exist or on error
   */
  async getPlayerData(userId: string): Promise<PlayerStats> {
    try {
      const userDoc = await fetchUserDocument(userId);
      
      return userDoc.exists() 
        ? parsePlayerStats(userDoc.data())
        : createDefaultStats();
    } catch (error) {
      console.error("Error getting player data:", error);
      return createDefaultStats();
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

    const mySide = this.getPlayerSide(user, gameData);
    if (!mySide) return null;

    const opponentSide = mySide === "white" ? "black" : "white";
    return gameData.players[opponentSide] || null;
  }

  /**
   * Get player's remaining time
   */
  getRemainingTime(
    side: "white" | "black",
    gameData: Game | null,
    currentTurn: "white" | "black"
  ): number {
    if (!gameData || !gameData.timeLeft || !gameData.updatedAt) return 0;

    // If game hasn't started, return initial time
    if (gameData.status === "waiting") return gameData.timeLeft[side];

    const now = Date.now();
    const elapsed = now - gameData.updatedAt;

    // Only decrease time for the current turn player
    if (side === currentTurn) {
      return Math.max(0, gameData.timeLeft[side] - elapsed);
    } else {
      return gameData.timeLeft[side];
    }
  }
}

// Export singleton instance
export const playerService = new PlayerService();

export default playerService;
