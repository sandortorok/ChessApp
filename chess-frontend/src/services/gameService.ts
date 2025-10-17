/**
 * Game Service
 * Handles general game logic and Firebase operations
 */

import { ref, set, update, get } from "firebase/database";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db, firestore } from "../firebase/config";
import type { Chess, Move } from "chess.js";
import type { Game, MoveHistoryType, winReason } from "../types";
import type { GameSettings } from "../components/CreateGameModal";

export class GameService {
  /**
   * Create a new game in Firebase
   */
  async createNewGame(gameId: string, settings?: GameSettings): Promise<void> {
    const timeControl = settings?.timeControl || 5; // minutes
    const increment = settings?.increment || 0; // seconds
    const opponentType = settings?.opponentType || "human";
    
    const initialTime = timeControl * 60 * 1000; // Convert to milliseconds
    const initialGame = {
      moves: [],
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      lastMove: null,
      players: { white: null, black: null },
      turn: "white",
      status: "waiting",
      started: false,
      timeLeft: { white: initialTime, black: initialTime },
      timeControl: timeControl,
      increment: increment,
      opponentType: opponentType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const gameRef = ref(db, `games/${gameId}`);
    await set(gameRef, initialGame);
    console.log("New game created:", gameId, "with settings:", { 
      timeControl, 
      increment,
      opponentType 
    });
  }

  /**
   * Update game state in Firebase after a move
   */
  async updateGameInDb(
    gameId: string,
    gameData: Game,
    chessGame: Chess,
    fen: string,
    move: Move
  ): Promise<{ whiteChange: number; blackChange: number } | null> {
    const gameRef = ref(db, `games/${gameId}`);
    const now = Date.now();
    const lastUpdate = gameData.updatedAt || now;
    
    const elapsed = gameData.started ? (now - lastUpdate) : 0;
    
    let winReasonValue: winReason | null = null;
    const currentTurnAfterMove = chessGame.turn() === "w" ? "white" : "black";
    const playerWhoJustMoved = currentTurnAfterMove === "white" ? "black" : "white";
    const newTimeLeft = { ...gameData.timeLeft };
    
    // Time management
    if (newTimeLeft && newTimeLeft[playerWhoJustMoved] !== undefined && gameData.started) {
      newTimeLeft[playerWhoJustMoved] = Math.max(0, newTimeLeft[playerWhoJustMoved] - elapsed);
      const incrementMs = (gameData.increment || 0) * 1000;
      newTimeLeft[playerWhoJustMoved] += incrementMs;
    }

    let status = "ongoing";
    let winner: "white" | "black" | "draw" | null = null;

    if (newTimeLeft[playerWhoJustMoved] === 0 && gameData.started) {
      status = "ended";
      winner = playerWhoJustMoved === "white" ? "black" : "white";
      winReasonValue = "timeout";
    }

    if (chessGame.isCheckmate()) {
      status = "ended";
      winner = chessGame.turn() === "w" ? "black" : "white";
      winReasonValue = "checkmate";
    } else if (this.getDrawReason(chessGame)) {
      status = "ended";
      winner = "draw";
      winReasonValue = this.getDrawReason(chessGame);
    }

    const currentMoves = gameData?.moves || [];
    const moveNumber = Math.floor(currentMoves.length / 2) + 1;

    const newMove: MoveHistoryType = {
      from: move.from,
      to: move.to,
      san: move.san,
      fen,
      updatedAt: Date.now(),
      moveNumber,
      timeLeft: newTimeLeft,
    };

    await update(gameRef, {
      fen,
      lastMove: { from: move.from, to: move.to, san: move.san },
      updatedAt: Date.now(),
      started: true,
      status,
      winner,
      moves: [...currentMoves, newMove],
      timeLeft: newTimeLeft,
      winReason: winReasonValue,
    });

    // Update Firestore if game ended
    if (status === "ended" && winner) {
      return await this.updateFirestoreOnGameEnd(gameId, gameData, winner);
    }

    return null;
  }

  /**
   * Determine draw reason
   */
  getDrawReason(chessGame: Chess): "stalemate" | "threefoldRepetition" | "insufficientMaterial" | "draw" | null {
    if (chessGame.isStalemate()) return "stalemate";
    if (chessGame.isThreefoldRepetition()) return "threefoldRepetition";
    if (chessGame.isInsufficientMaterial()) return "insufficientMaterial";
    if (chessGame.isDraw()) return "draw";
    return null;
  }

  /**
   * Calculate ELO change
   */
  calculateEloChange(
    winnerElo: number, 
    loserElo: number, 
    isDraw: boolean = false
  ): { winnerChange: number; loserChange: number } {
    const K = 32;
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    if (isDraw) {
      const winnerChange = Math.round(K * (0.5 - expectedWinner));
      const loserChange = Math.round(K * (0.5 - expectedLoser));
      return { winnerChange, loserChange };
    }

    const winnerChange = Math.round(K * (1 - expectedWinner));
    const loserChange = Math.round(K * (0 - expectedLoser));
    return { winnerChange, loserChange };
  }

  /**
   * Update Firestore on game end
   */
  async updateFirestoreOnGameEnd(
    gameId: string,
    gameData: Game,
    winner: "white" | "black" | "draw" | null
  ): Promise<{ whiteChange: number; blackChange: number } | null> {
    if (!winner || !gameData?.players?.white?.uid || !gameData?.players?.black?.uid) return null;

    try {
      const whitePlayerRef = doc(firestore, "users", gameData.players.white.uid);
      const blackPlayerRef = doc(firestore, "users", gameData.players.black.uid);

      const whiteDoc = await getDoc(whitePlayerRef);
      const blackDoc = await getDoc(blackPlayerRef);

      const whiteData = whiteDoc.exists() ? whiteDoc.data() : { elo: 1200, wins: 0, losses: 0, draws: 0 };
      const blackData = blackDoc.exists() ? blackDoc.data() : { elo: 1200, wins: 0, losses: 0, draws: 0 };

      if (winner === "draw") {
        const { winnerChange: whiteChange, loserChange: blackChange } = this.calculateEloChange(
          whiteData.elo || 1200,
          blackData.elo || 1200,
          true
        );

        await updateDoc(whitePlayerRef, {
          elo: increment(whiteChange),
          draws: increment(1),
        });

        await updateDoc(blackPlayerRef, {
          elo: increment(blackChange),
          draws: increment(1),
        });

        const finalElo = {
          white: whiteData.elo + whiteChange,
          black: blackData.elo + blackChange
        };
        const gameRef = ref(db, `games/${gameId}`);
        await update(gameRef, { finalElo });
        
        return { whiteChange, blackChange };
      } else {
        const winnerData = winner === "white" ? whiteData : blackData;
        const loserData = winner === "white" ? blackData : whiteData;
        const winnerRef = winner === "white" ? whitePlayerRef : blackPlayerRef;
        const loserRef = winner === "white" ? blackPlayerRef : whitePlayerRef;

        const { winnerChange, loserChange } = this.calculateEloChange(
          winnerData.elo || 1200,
          loserData.elo || 1200
        );

        await updateDoc(winnerRef, {
          elo: increment(winnerChange),
          wins: increment(1),
        });

        await updateDoc(loserRef, {
          elo: increment(loserChange),
          losses: increment(1),
        });

        const finalElo = {
          white: winner === "white" ? (whiteData.elo + winnerChange) : (whiteData.elo + loserChange),
          black: winner === "black" ? (blackData.elo + winnerChange) : (blackData.elo + loserChange)
        };
        const gameRef = ref(db, `games/${gameId}`);
        await update(gameRef, { finalElo });
        
        return {
          whiteChange: winner === "white" ? winnerChange : loserChange,
          blackChange: winner === "black" ? winnerChange : loserChange
        };
      }
    } catch (error) {
      console.error("Error updating Firestore on game end:", error);
      return null;
    }
  }

  /**
   * Save starting ELO when both players joined
   */
  async saveStartingElo(gameId: string, whiteUid: string, blackUid: string): Promise<void> {
    try {
      const whiteDoc = await getDoc(doc(firestore, "users", whiteUid));
      const blackDoc = await getDoc(doc(firestore, "users", blackUid));

      const whiteElo = whiteDoc.exists() ? (whiteDoc.data().elo || 1200) : 1200;
      const blackElo = blackDoc.exists() ? (blackDoc.data().elo || 1200) : 1200;

      const gameRef = ref(db, `games/${gameId}`);
      await update(gameRef, {
        startingElo: { white: whiteElo, black: blackElo }
      });

      console.log("Starting ELO saved:", { white: whiteElo, black: blackElo });
    } catch (error) {
      console.error("Error saving starting ELO:", error);
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
  async acceptDraw(gameId: string, gameData: Game): Promise<{ whiteChange: number; blackChange: number } | null> {
    const gameRef = ref(db, `games/${gameId}`);
    
    await update(gameRef, {
      status: "ended",
      winner: "draw",
      winReason: "aggreement",
      drawOfferedBy: null,
    });

    return await this.updateFirestoreOnGameEnd(gameId, gameData, "draw");
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
      status: "ended",
      winner: "draw",
      winReason: "aborted",
      updatedAt: now,
    });
  }

  /**
   * Surrender game
   */
  async surrenderGame(
    gameId: string, 
    gameData: Game, 
    surrenderingSide: "white" | "black"
  ): Promise<{ whiteChange: number; blackChange: number } | null> {
    const gameRef = ref(db, `games/${gameId}`);
    const winner = surrenderingSide === "white" ? "black" : "white";
    
    await update(gameRef, {
      status: "ended",
      winner,
      winReason: "resignation",
    });

    return await this.updateFirestoreOnGameEnd(gameId, gameData, winner);
  }

  /**
   * Handle timeout
   */
  async handleTimeout(
    gameId: string,
    gameData: Game,
    timeoutSide: "white" | "black"
  ): Promise<{ whiteChange: number; blackChange: number } | null> {
    const gameRef = ref(db, `games/${gameId}`);
    const winner = timeoutSide === "white" ? "black" : "white";

    await update(gameRef, {
      status: "ended",
      winner,
      winReason: "timeout"
    });
    
    return await this.updateFirestoreOnGameEnd(gameId, gameData, winner);
  }

  /**
   * Check if game exists
   */
  async gameExists(gameId: string): Promise<boolean> {
    const gameRef = ref(db, `games/${gameId}`);
    const snap = await get(gameRef);
    return snap.exists();
  }
}

// Export singleton instance
export const gameService = new GameService();

export default gameService;
