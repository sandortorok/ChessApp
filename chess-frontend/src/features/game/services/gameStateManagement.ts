import { BehaviorSubject } from "rxjs";
import { ref, onValue, type Unsubscribe } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import type { Game } from "@/features/game";
import { DEFAULT_GAME } from '../constants/gameDefaults';

/**
 * Singleton service to manage game state
 */
class GameStateService {
    private static instance: GameStateService | null = null;
    private firebaseUnsubscribe: Unsubscribe | null = null;

    private constructor() { }
    public static getInstance(): GameStateService {
        if (!GameStateService.instance) {
            GameStateService.instance = new GameStateService();
        }
        return GameStateService.instance;
    }
    private gameDataSubject = new BehaviorSubject<Game>({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Kezdő pozíció
        moves: [],
        lastMove: null,
        players: null,
        turn: 'white',
        status: 'waiting',
        winner: null,
        winReason: null,
        timeLeft: { white: 0, black: 0 },
        createdAt: 0,
        updatedAt: 0,
        drawOfferedBy: null,
        timeControl: 0,
        increment: 0,
        opponentType: undefined,
        startingElo: undefined,
        finalElo: undefined
    });
    public readonly gameData$ = this.gameDataSubject.asObservable();
    public subscribeToGame(gameId: string): void {
        if (this.firebaseUnsubscribe) {
            this.firebaseUnsubscribe();
        }

        const gameRef = ref(db, `games/${gameId}`);
        this.firebaseUnsubscribe = onValue(gameRef, (snapshot) => {
            const game: Game | null = snapshot.val();
            if (game) {
                console.log("Game data updated:", game);
                this.gameDataSubject.next(game);
            }
        });
    }
      // ÚJ METÓDUS: Leiratkozás
    public unsubscribeFromGame(): void {
        if (this.firebaseUnsubscribe) {
        this.firebaseUnsubscribe();
        this.firebaseUnsubscribe = null;
        }
    }
}
export const gameStateService = GameStateService.getInstance();


