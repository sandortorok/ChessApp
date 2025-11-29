/**
 * AI Game Service
 * Handles AI opponent games using Lichess API
 */

import { Chess } from "chess.js";
import { lichessService, type LichessAILevel } from "./lichessService";

export class AIGameService {
  private activeGames: Map<string, string> = new Map(); // gameId -> lichessGameId
  private gameStreamCleanups: Map<string, () => void> = new Map();

  /**
   * Start an AI game on Lichess
   */
  async startAIGame(
    gameId: string,
    level: LichessAILevel,
    playerColor: "white" | "black" | "random",
    timeControl?: { limit: number; increment: number }
  ): Promise<{ lichessGameId: string; lichessUrl: string; assignedColor: "white" | "black" }> {
    try {
      // Challenge Lichess AI
      const challenge = await lichessService.challengeAI(level, playerColor, timeControl);
      
      // Store the mapping
      this.activeGames.set(gameId, challenge.id);
      
      console.log("AI game started:", {
        gameId,
        lichessGameId: challenge.id,
        level,
        color: challenge.color,
        url: challenge.url
      });

      return {
        lichessGameId: challenge.id,
        lichessUrl: challenge.url,
        assignedColor: challenge.color
      };
    } catch (error) {
      console.error("Error starting AI game:", error);
      throw error;
    }
  }

  /**
   * Stream game state from Lichess and sync to Firebase
   */
  streamAIGameState(
    gameId: string,
    lichessGameId: string,
    onMoveReceived: (uciMove: string, fen: string) => void
  ): () => void {
    const cleanup = lichessService.streamGameState(
      lichessGameId,
      (state) => {
        console.log("Lichess game state:", state);

        // Parse moves and get the latest one
        if (state.moves) {
          const moves = lichessService.parseMoves(state.moves);
          if (moves.length > 0) {
            const latestMove = moves[moves.length - 1];
            onMoveReceived(latestMove, state.fen);
          }
        }

        // Check game status
        if (state.status === "mate" || state.status === "resign" || state.status === "stalemate") {
          console.log("Lichess game ended:", state.status, "Winner:", state.winner);
        }
      },
      (fullGame) => {
        console.log("Lichess full game data:", fullGame);
      }
    );

    this.gameStreamCleanups.set(gameId, cleanup);
    return cleanup;
  }

  /**
   * Make a move to Lichess
   */
  async makeAIMove(gameId: string, uciMove: string): Promise<void> {
    const lichessGameId = this.activeGames.get(gameId);
    if (!lichessGameId) {
      throw new Error("No active Lichess game for this game ID");
    }

    try {
      await lichessService.makeMove(lichessGameId, uciMove);
      console.log("Move sent to Lichess:", uciMove);
    } catch (error) {
      console.error("Error making move to Lichess:", error);
      throw error;
    }
  }

  /**
   * Get best move from Lichess cloud analysis (for hints)
   */
  async getHint(fen: string): Promise<string | null> {
    try {
      const bestMove = await lichessService.getBestMove(fen);
      return bestMove;
    } catch (error) {
      console.error("Error getting hint:", error);
      return null;
    }
  }

  /**
   * Convert UCI move to SAN notation
   */
  uciToSan(uciMove: string, chess: Chess): string {
    return lichessService.uciToSan(uciMove, chess);
  }

  /**
   * Apply UCI move to chess instance
   */
  applyUciMove(chess: Chess, uciMove: string): boolean {
    try {
      const from = uciMove.substring(0, 2);
      const to = uciMove.substring(2, 4);
      const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

      const move = chess.move({ from, to, promotion });
      return move !== null;
    } catch {
      return false;
    }
  }

  /**
   * Resign AI game
   */
  async resignAIGame(gameId: string): Promise<void> {
    const lichessGameId = this.activeGames.get(gameId);
    if (!lichessGameId) {
      throw new Error("No active Lichess game for this game ID");
    }

    try {
      await lichessService.resign(lichessGameId);
      console.log("Resigned from Lichess game:", lichessGameId);
    } catch (error) {
      console.error("Error resigning from Lichess:", error);
      throw error;
    }
  }

  /**
   * Abort AI game (only works in first few moves)
   */
  async abortAIGame(gameId: string): Promise<void> {
    const lichessGameId = this.activeGames.get(gameId);
    if (!lichessGameId) {
      throw new Error("No active Lichess game for this game ID");
    }

    try {
      await lichessService.abort(lichessGameId);
      console.log("Aborted Lichess game:", lichessGameId);
    } catch (error) {
      console.error("Error aborting Lichess game:", error);
      throw error;
    }
  }

  /**
   * Cleanup game resources
   */
  cleanupGame(gameId: string): void {
    // Close stream
    const cleanup = this.gameStreamCleanups.get(gameId);
    if (cleanup) {
      cleanup();
      this.gameStreamCleanups.delete(gameId);
    }

    // Remove from active games
    this.activeGames.delete(gameId);
    
    console.log("AI game cleaned up:", gameId);
  }

  /**
   * Get Lichess game ID for a game
   */
  getLichessGameId(gameId: string): string | undefined {
    return this.activeGames.get(gameId);
  }

  /**
   * Check if game is an active AI game
   */
  isAIGame(gameId: string): boolean {
    return this.activeGames.has(gameId);
  }

  /**
   * Get AI level description
   */
  getAILevelDescription(level: LichessAILevel): string {
    return lichessService.getLevelDescription(level);
  }

  /**
   * Initialize Lichess token
   */
  initializeLichess(token: string): void {
    lichessService.setToken(token);
  }

  /**
   * Check if Lichess is ready
   */
  isLichessReady(): boolean {
    return lichessService.hasToken();
  }

  /**
   * Cleanup all active games
   */
  cleanupAll(): void {
    // Close all streams
    this.gameStreamCleanups.forEach((cleanup) => cleanup());
    this.gameStreamCleanups.clear();

    // Clear active games
    this.activeGames.clear();

    // Cleanup Lichess service
    lichessService.cleanup();
    
    console.log("All AI games cleaned up");
  }
}

// Export singleton instance
export const aiGameService = new AIGameService();

export default aiGameService;
