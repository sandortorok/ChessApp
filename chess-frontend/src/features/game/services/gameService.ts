/**
 * Game Service
 * Handles general game logic and Firebase operations
 */

import { ref, update, get } from "firebase/database";
import { doc, getDoc, updateDoc, increment, type DocumentData } from "firebase/firestore";
import { db, firestore } from "@/lib/firebase/config";
import type { Chess, Move } from "chess.js";
import type { Game, GameEndInfo, MoveHistoryType, PlayerColor, Status, TimeLeft, Winner, winReason } from "../types/index";

export class GameService {
  // isLegalMove(chessGame: Chess, sourceSquare: string, targetSquare: string): boolean {
  //   const legalMoves = chessGame.moves({ square: sourceSquare as any, verbose: true });
  //   return legalMoves.some(move => move.to === targetSquare);
  // }
  /**
   * Update game state in Firebase after a move
   */
  move(chessGame: Chess, sourceSquare: string, targetSquare: string) {
    const move = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) return null;
    return move;
  }
  calculateTimeLeft(gameData: Game, playerWhoMoved: PlayerColor): TimeLeft {
    const now = Date.now();
    const lastUpdate = gameData.updatedAt || now;
    const elapsed = gameData.status !== "waiting" ? (now - lastUpdate) : 0;
    const newTimeLeft: TimeLeft = { ...gameData.timeLeft };

    // Subtract elapsed time from the player who just moved
    if (gameData.status !== "waiting") {
      newTimeLeft[playerWhoMoved] = Math.max(0, newTimeLeft[playerWhoMoved] - elapsed);
      const incrementMs = (gameData.increment || 0) * 1000;
      newTimeLeft[playerWhoMoved] += incrementMs;
    }
    return newTimeLeft;
  }


  checkGameEndConditions(chessGame: Chess, gameData: Game, timeLeft: TimeLeft):GameEndInfo {
    let status: Status = "ongoing";
    let winner: "white" | "black" | "draw" | null = null;
    let winReasonValue: winReason | null = null;
    const playerMoved = gameData.turn === "white" ? "black" : "white"; // Checking for the player who just moved
    if (timeLeft[playerMoved] === 0 && gameData.status !== "waiting") {
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

    return { status, winner, winReasonValue };
  }


  private buildUpdatePayload(
    fen: string,
    move: Move,
    gameEndInfo: { status: Status; winner: Winner | null; winReasonValue: winReason | null },
    newTimeLeft: TimeLeft,
    newMove: MoveHistoryType,
    currentMoves: MoveHistoryType[]
  ): Partial<Game> {
    return {
      fen,
      lastMove: {
        from: move.from,
        to: move.to,
        san: move.san,
      },
      updatedAt: Date.now(),
      status: gameEndInfo.status,
      winner: gameEndInfo.winner,
      moves: [...currentMoves, newMove],
      timeLeft: newTimeLeft,
      winReason: gameEndInfo.winReasonValue,
    };
  }
  private createNewMoveHistoryElement(
    gameData: Game, move: Move, fen: string, timeLeft: TimeLeft
  ): MoveHistoryType {
    const currentMoves = gameData?.moves || [];
    const moveNumber = Math.floor(currentMoves.length / 2) + 1;

    return {
      from: move.from,
      to: move.to,
      san: move.san,
      fen,
      updatedAt: Date.now(),
      moveNumber: moveNumber,
      timeLeft,
    };
  }
  async updateGameInDb(
    gameId: string,
    gameData: Game,
    chessGame: Chess,
    newFen: string,
    move: Move
  ): Promise<void> {
    // chessGame.turn() returns the NEXT player (after the move)
    // So the player who just moved is the opposite
    const playerWhoMoved = chessGame.turn() === "w" ? "black" : "white";
    const newTimeLeft = this.calculateTimeLeft(gameData, playerWhoMoved);
    const gameEndInfo = this.checkGameEndConditions(chessGame, gameData, newTimeLeft);
    const newMove = this.createNewMoveHistoryElement(gameData, move, newFen, newTimeLeft);
    const currentMoves = gameData?.moves || [];
    const updateData = this.buildUpdatePayload(newFen, move, gameEndInfo, newTimeLeft, newMove, currentMoves);

    try {
      await update(ref(db, `games/${gameId}`), updateData);

      if (gameEndInfo.status === "ended" && gameEndInfo.winner) {
        await this.updateFirestoreOnGameEnd(gameId, gameData, gameEndInfo.winner);
      }
    } catch (error) {
      console.error(`Failed to update game ${gameId}:`, error);
      throw error;
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
  calculateEloChange(whiteElo: number, blackElo: number, winner: Winner): { whiteChange: number; blackChange: number } {
    const K = 32;
    const expectedWhite = 1 / (1 + Math.pow(10, (blackElo - whiteElo) / 400));
    const expectedBlack = 1 / (1 + Math.pow(10, (whiteElo - blackElo) / 400));

    if (winner === "draw") {
      const whiteChange = Math.round(K * (0.5 - expectedWhite));
      const blackChange = Math.round(K * (0.5 - expectedBlack));
      return { whiteChange, blackChange };
    }

    if (winner === "white") {
      const whiteChange = Math.round(K * (1 - expectedWhite));
      const blackChange = Math.round(K * (0 - expectedBlack));
      return { whiteChange, blackChange };
    }

    // winner === "black"
    const whiteChange = Math.round(K * (0 - expectedWhite));
    const blackChange = Math.round(K * (1 - expectedBlack));
    console.log({ whiteChange, blackChange });
    return { whiteChange, blackChange };
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
  async updateFirestoreOnGameEnd(gameId: string, gameData: Game, winner: Winner): Promise<void> {
    const whiteUid = gameData?.players?.white?.uid;
    const blackUid = gameData?.players?.black?.uid;
    if (!winner || !whiteUid || !blackUid) return;

    try {
      const [whiteData, blackData] = await Promise.all([
        this.getPlayerData(whiteUid),
        this.getPlayerData(blackUid),
      ]);
      if (!whiteData || !blackData) return;

      const { whiteChange, blackChange } = this.calculateEloChange(whiteData.elo, blackData.elo, winner);


      await Promise.all([
        this.updateStatsOnGameEnd(whiteUid, winner === "white", winner === "draw", whiteChange),
        this.updateStatsOnGameEnd(blackUid, winner === "black", winner === "draw", blackChange),
      ]);

      const finalElo = {
        white: whiteData.elo + whiteChange,
        black: blackData.elo + blackChange
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
    surrenderingSide: PlayerColor
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
    timeoutSide: PlayerColor
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
