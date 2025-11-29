/**
 * Game Service
 * Handles general game logic and Firebase operations
 */

import { ref, set, update, get } from "firebase/database";
import { doc, getDoc, updateDoc, increment, type DocumentData } from "firebase/firestore";
import { db, firestore } from "../firebase/config";
import type { Chess, Move } from "chess.js";
import type { Game, MoveHistoryType, winReason } from "../types";
import type { GameSettings } from "../components/CreateGameModal";

export class GameService {
  /**
   * Create a new game in Firebase
   */
  async createNewGame(gameId: string, settings: GameSettings): Promise<void> {
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
      timeLeft: { white: initialTime, black: initialTime },
      timeControl: timeControl,
      increment: increment,
      opponentType: opponentType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const gameRef = ref(db, `games/${gameId}`);
    await set(gameRef, initialGame);
  }

  isLegalMove(chessGame: Chess, sourceSquare: string, targetSquare: string): boolean {
    const legalMoves = chessGame.moves({ square: sourceSquare as any, verbose: true });
    return legalMoves.some(move => move.to === targetSquare);
  }
  /**
   * Update game state in Firebase after a move
   */
  move(chessGame: Chess, sourceSquare: string, targetSquare: string) {
    const move = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) return null;
    return move;
  }
  calculateTimeLeft(gameData: Game) {
    const now = Date.now();
    const lastUpdate = gameData.updatedAt || now;
    const elapsed = gameData.status !== "waiting" ? (now - lastUpdate) : 0;
    const newTimeLeft = { ...gameData.timeLeft };
    const reverseTurn = gameData.turn === "white" ? "black" : "white";
    // Time management
    if (gameData.status !== "waiting") {
      newTimeLeft[reverseTurn] = Math.max(0, newTimeLeft[reverseTurn] - elapsed);
      const incrementMs = (gameData.increment || 0) * 1000;
      newTimeLeft[reverseTurn] += incrementMs;
    }
    return newTimeLeft;
  }
  async updateGameInDb(
    gameId: string,
    gameData: Game,
    chessGame: Chess,
    fen: string,
    move: Move
  ): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);

    let winReasonValue: winReason | null = null;

    const newTimeLeft = this.calculateTimeLeft(gameData);

    let status = "ongoing";
    let winner: "white" | "black" | "draw" | null = null;
    //Mivel már léptünk, az előző játékos volt a lépő
    const playerMoved = gameData.turn === "white" ? "black" : "white";
    if (newTimeLeft[playerMoved] === 0 && gameData.status !== "waiting") {
      status = "ended";
      winner = playerMoved;
      winReasonValue = "timeout";
    }

    if (chessGame.isCheckmate()) {
      status = "ended";
      winner = playerMoved;
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
      status,
      winner,
      moves: [...currentMoves, newMove],
      timeLeft: newTimeLeft,
      winReason: winReasonValue,
    });

    // Update Firestore if game ended
    if (status === "ended" && winner) {
      await this.updateFirestoreOnGameEnd(gameId, gameData, winner);
    }
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
  // Ha döntetlen van akkor ugyanolyan sorrendbe kapjuk vissza az értékeket mint ahogy beadtuk
  // szóval ha a winner a fehér az inputban akkor a visszatérési értékben is először a fehér változó lesz
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
  async getPlayerData(uid: string): Promise<DocumentData | null> {
    const playerRef = doc(firestore, "users", uid);
    const playerDoc = await getDoc(playerRef);
    if (playerDoc.exists()) {
      return playerDoc.data();
    } else {
      return null;
    }
  }
  async updateStatsOnGameEnd(uid: string, isWinner: boolean, isDraw: boolean, eloChange: number): Promise<void> {
    const playerRef = doc(firestore, "users", uid);
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
   * Update Firestore on game end
   */
  async updateFirestoreOnGameEnd(gameId: string,gameData: Game,winner: "white" | "black" | "draw" | null
  ): Promise<void> {
    if (!winner || !gameData?.players?.white?.uid || !gameData?.players?.black?.uid) return;

    try {
      const whiteData = await this.getPlayerData(gameData.players.white.uid);
      const blackData = await this.getPlayerData(gameData.players.black.uid);
      if (!whiteData || !blackData) return;
      const blackWin = winner === "black";
      const isDraw = winner === "draw";
      const whiteWin = winner === "white";
      const winnerData = blackWin ? blackData : whiteData;
      const loserData = blackWin ? whiteData : blackData;
      const { winnerChange, loserChange } = this.calculateEloChange(winnerData.elo, loserData.elo, winner === "draw");
      await this.updateStatsOnGameEnd(
        gameData.players.white.uid, 
        whiteWin,
        isDraw,
        blackWin ? loserChange : winnerChange);
      await this.updateStatsOnGameEnd(
        gameData.players.black.uid, 
        blackWin,
        isDraw,
        blackWin ? winnerChange : loserChange);

      const finalElo = {
        white: blackWin ? (whiteData.elo + loserChange) : (whiteData.elo + winnerChange),
        black: blackWin ? (blackData.elo + winnerChange) : (blackData.elo + loserChange)
      }
      const gameRef = ref(db, `games/${gameId}`);
      await update(gameRef, { finalElo });
      return;
    } catch (error) {
      console.error("Error updating Firestore on game end:", error);
      return;
    }
  }

  /**
   * Save starting ELO when both players joined
   */
  async saveStartingElo(gameId: string, whiteUid: string, blackUid: string): Promise<void> {
    try {
      const whiteData = await this.getPlayerData(whiteUid)
      const blackData = await this.getPlayerData(blackUid);
      if (!whiteData || !blackData) return;

      const gameRef = ref(db, `games/${gameId}`);
      await update(gameRef, {
        startingElo: { white: whiteData.elo, black: blackData.elo }
      });

      console.log("Starting ELO saved:", { white: whiteData.elo, black: blackData.elo });
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
  async acceptDraw(gameId: string, gameData: Game): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);

    await update(gameRef, {
      status: "ended",
      winner: "draw",
      winReason: "aggreement",
      drawOfferedBy: null,
    });

    await this.updateFirestoreOnGameEnd(gameId, gameData, "draw");
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
  ): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    const winner = surrenderingSide === "white" ? "black" : "white";

    await update(gameRef, {
      status: "ended",
      winner,
      winReason: "resignation",
    });

    await this.updateFirestoreOnGameEnd(gameId, gameData, winner);
  }

  /**
   * Handle timeout
   */
  async handleTimeout(
    gameId: string,
    gameData: Game,
    timeoutSide: "white" | "black"
  ): Promise<void> {
    const gameRef = ref(db, `games/${gameId}`);
    const winner = timeoutSide === "white" ? "black" : "white";

    await update(gameRef, {
      status: "ended",
      winner,
      winReason: "timeout"
    });

    await this.updateFirestoreOnGameEnd(gameId, gameData, winner);
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
