/**
 * Lichess API Service
 * Provides integration with Lichess.org for AI games and analysis
 */

export type LichessAILevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Color = 'white' | 'black' | 'random';
export type Speed = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'correspondence';

interface LichessChallenge {
  id: string;
  url: string;
  color: 'white' | 'black';
  variant: {
    key: string;
    name: string;
  };
  speed: string;
  perf: {
    name: string;
  };
  rated: boolean;
  status: string;
}

interface LichessGameState {
  id: string;
  variant: { key: string; name: string };
  speed: string;
  perf: string;
  rated: boolean;
  initialFen: string;
  fen: string;
  player: string;
  turns: number;
  startedAtTurn: number;
  status: string;
  winner?: 'white' | 'black';
  wtime?: number;
  btime?: number;
  winc?: number;
  binc?: number;
  moves: string;
  clock?: {
    initial: number;
    increment: number;
    totalTime: number;
  };
}

class LichessService {
  private apiToken: string = '';
  private baseURL = 'https://lichess.org/api';
  private eventSource: EventSource | null = null;

  /**
   * Set the Lichess API token
   * Get your token from: https://lichess.org/account/oauth/token
   */
  setToken(token: string): void {
    this.apiToken = token;
  }

  /**
   * Check if the service has a valid token
   */
  hasToken(): boolean {
    return this.apiToken.length > 0;
  }

  /**
   * Challenge the Lichess AI to a game
   * @param level - AI difficulty level (1-8)
   * @param color - Your color preference ('white', 'black', or 'random')
   * @param clock - Optional time control in seconds (e.g., 300 for 5 minutes)
   * @param increment - Optional increment in seconds
   * @returns Promise with challenge information including game URL
   */
  async challengeAI(
    level: LichessAILevel = 4,
    color: Color = 'random',
    clock?: { limit: number; increment: number }
  ): Promise<LichessChallenge> {
    if (!this.hasToken()) {
      throw new Error('Lichess API token not set. Use setToken() first.');
    }

    const params = new URLSearchParams({
      level: level.toString(),
      color: color,
    });

    if (clock) {
      params.append('clock.limit', clock.limit.toString());
      params.append('clock.increment', clock.increment.toString());
    }

    try {
      const response = await fetch(`${this.baseURL}/challenge/ai`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to challenge AI: ${response.status} - ${
            errorData.error || response.statusText
          }`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error challenging Lichess AI:', error);
      throw error;
    }
  }

  /**
   * Make a move in a game
   * @param gameId - The game ID
   * @param move - The move in UCI format (e.g., "e2e4")
   * @param offeringDraw - Whether to offer a draw with this move
   * @returns Promise with move result
   */
  async makeMove(
    gameId: string,
    move: string,
    offeringDraw: boolean = false
  ): Promise<{ ok: boolean }> {
    if (!this.hasToken()) {
      throw new Error('Lichess API token not set. Use setToken() first.');
    }

    try {
      const url = `${this.baseURL}/board/game/${gameId}/move/${move}`;
      const params = offeringDraw ? '?offeringDraw=true' : '';

      const response = await fetch(url + params, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to make move: ${response.status} - ${
            errorData.error || response.statusText
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error making move:', error);
      throw error;
    }
  }

  /**
   * Stream game state updates in real-time
   * @param gameId - The game ID
   * @param onGameState - Callback for game state updates
   * @param onGameFull - Callback for full game data (called once at start)
   * @returns Function to close the stream
   */
  streamGameState(
    gameId: string,
    onGameState: (state: LichessGameState) => void,
    onGameFull?: (data: any) => void
  ): () => void {
    if (!this.hasToken()) {
      throw new Error('Lichess API token not set. Use setToken() first.');
    }

    // Close existing connection
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = `${this.baseURL}/board/game/stream/${gameId}`;
    this.eventSource = new EventSource(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    } as any);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'gameFull') {
          if (onGameFull) {
            onGameFull(data);
          }
          // Initial state is also included
          if (data.state) {
            onGameState(data.state);
          }
        } else if (data.type === 'gameState') {
          onGameState(data);
        }
      } catch (error) {
        console.error('Error parsing game state:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      this.eventSource?.close();
    };

    // Return cleanup function
    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  /**
   * Get current ongoing games
   * @returns Promise with array of ongoing games
   */
  async getOngoingGames(): Promise<any[]> {
    if (!this.hasToken()) {
      throw new Error('Lichess API token not set. Use setToken() first.');
    }

    try {
      const response = await fetch(`${this.baseURL}/account/playing`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get ongoing games: ${response.status}`);
      }

      const data = await response.json();
      return data.nowPlaying || [];
    } catch (error) {
      console.error('Error getting ongoing games:', error);
      throw error;
    }
  }

  /**
   * Get game data (moves, players, etc.)
   * @param gameId - The game ID
   * @returns Promise with game data
   */
  async getGame(gameId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/game/${gameId}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get game: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting game:', error);
      throw error;
    }
  }

  /**
   * Resign from a game
   * @param gameId - The game ID
   */
  async resign(gameId: string): Promise<{ ok: boolean }> {
    if (!this.hasToken()) {
      throw new Error('Lichess API token not set. Use setToken() first.');
    }

    try {
      const response = await fetch(`${this.baseURL}/board/game/${gameId}/resign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to resign: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error resigning:', error);
      throw error;
    }
  }

  /**
   * Abort a game (only works in first few moves)
   * @param gameId - The game ID
   */
  async abort(gameId: string): Promise<{ ok: boolean }> {
    if (!this.hasToken()) {
      throw new Error('Lichess API token not set. Use setToken() first.');
    }

    try {
      const response = await fetch(`${this.baseURL}/board/game/${gameId}/abort`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to abort: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error aborting game:', error);
      throw error;
    }
  }

  /**
   * Accept or decline a draw offer
   * @param gameId - The game ID
   * @param accept - True to accept, false to decline
   */
  async handleDrawOffer(gameId: string, accept: boolean): Promise<{ ok: boolean }> {
    if (!this.hasToken()) {
      throw new Error('Lichess API token not set. Use setToken() first.');
    }

    const action = accept ? 'accept' : 'decline';

    try {
      const response = await fetch(
        `${this.baseURL}/board/game/${gameId}/draw/${action}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} draw: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error ${action}ing draw:`, error);
      throw error;
    }
  }

  /**
   * Get cloud evaluation for a position
   * @param fen - FEN notation of the position
   * @param multiPv - Number of principal variations (1-5)
   * @returns Promise with evaluation data
   */
  async getCloudEvaluation(fen: string, multiPv: number = 1): Promise<any> {
    try {
      const params = new URLSearchParams({
        fen: fen,
        multiPv: multiPv.toString(),
      });

      const response = await fetch(
        `https://lichess.org/api/cloud-eval?${params}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get evaluation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting cloud evaluation:', error);
      throw error;
    }
  }

  /**
   * Get the best move from Lichess cloud analysis
   * @param fen - FEN notation of the position
   * @returns Promise with best move in UCI format or null if not available
   */
  async getBestMove(fen: string): Promise<string | null> {
    try {
      const evaluation = await this.getCloudEvaluation(fen, 1);
      
      if (evaluation.pvs && evaluation.pvs.length > 0) {
        const bestLine = evaluation.pvs[0];
        if (bestLine.moves) {
          // Return the first move from the principal variation
          const moves = bestLine.moves.split(' ');
          return moves[0] || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting best move:', error);
      return null;
    }
  }

  /**
   * Convert UCI move format to SAN (requires chess.js instance)
   * @param uci - Move in UCI format (e.g., "e2e4")
   * @param chess - chess.js instance
   * @returns SAN notation (e.g., "e4") or original UCI if conversion fails
   */
  uciToSan(uci: string, chess: any): string {
    try {
      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promotion = uci.length > 4 ? uci[4] : undefined;

      const move = chess.move({ from, to, promotion });
      if (move) {
        chess.undo();
        return move.san;
      }
      return uci;
    } catch {
      return uci;
    }
  }

  /**
   * Parse moves string into array of UCI moves
   * @param moves - Space-separated UCI moves (e.g., "e2e4 e7e5 g1f3")
   * @returns Array of UCI moves
   */
  parseMoves(moves: string): string[] {
    if (!moves || moves.trim() === '') {
      return [];
    }
    return moves.trim().split(' ');
  }

  /**
   * Get difficulty description for AI level
   */
  getLevelDescription(level: LichessAILevel): string {
    const descriptions: Record<LichessAILevel, string> = {
      1: 'Nagyon könnyű',
      2: 'Könnyű',
      3: 'Közepes',
      4: 'Közepes+',
      5: 'Nehéz',
      6: 'Nehéz+',
      7: 'Nagyon nehéz',
      8: 'Expert',
    };
    return descriptions[level];
  }

  /**
   * Cleanup all connections
   */
  cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// Export singleton instance
export const lichessService = new LichessService();

export default lichessService;
