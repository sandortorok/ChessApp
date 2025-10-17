/**
 * Player Service
 * Handles player-related operations (joining games, user data)
 */

import { ref, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { db, firestore } from "../firebase/config";
import type { User } from "firebase/auth";
import type { Game } from "../types";

export class PlayerService {
  /**
   * Join a game as a player
   */
  async joinGame(
    gameId: string,
    user: User,
    gameData: Game
  ): Promise<"white" | "black" | null> {
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
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    const userData = userDoc.exists() 
      ? userDoc.data() 
      : { elo: 1200, wins: 0, losses: 0, draws: 0 };

    const newPlayer = {
      uid: user.uid,
      name: user.displayName || user.email, // Ezt használja a PlayerInfo komponens
      displayName: user.displayName,
      email: user.email,
      elo: userData.elo || 1200,
      wins: userData.wins || 0,
      losses: userData.losses || 0,
      draws: userData.draws || 0,
    };

    await set(ref(db, `games/${gameId}/players/${sideToJoin}`), newPlayer);
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
   */
  async getPlayerData(userId: string): Promise<{
    elo: number;
    wins: number;
    losses: number;
    draws: number;
  }> {
    try {
      const userDoc = await getDoc(doc(firestore, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          elo: data.elo || 1200,
          wins: data.wins || 0,
          losses: data.losses || 0,
          draws: data.draws || 0,
        };
      }
      return { elo: 1200, wins: 0, losses: 0, draws: 0 };
    } catch (error) {
      console.error("Error getting player data:", error);
      return { elo: 1200, wins: 0, losses: 0, draws: 0 };
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
    if (!gameData.started) return gameData.timeLeft[side];

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
