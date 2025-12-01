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
    private gameDataSubject = new BehaviorSubject<Game>(DEFAULT_GAME);
    public readonly gameData$ = this.gameDataSubject.asObservable();
    private gameIdSubject = new BehaviorSubject<string | null>(null);
    public readonly gameId$ = this.gameIdSubject.asObservable();

    public setGameId(gameId: string | null): void {
        this.gameIdSubject.next(gameId);
    }
    public createFirebaseSubscription(gameId: string): void {
        if (this.firebaseUnsubscribe) {
            this.firebaseUnsubscribe();
        }
        this.setGameId(gameId);

        const gameRef = ref(db, `games/${gameId}`);
        this.firebaseUnsubscribe = onValue(gameRef, (snapshot) => {
            const game: Game | null = snapshot.val();
            if (game) {
                // realtime database doesn't save empty arrays, so we need to normalize
                const normalizedGame: Game = {
                    ...game,
                    moves: game.moves ?? []
                };
                console.log("Received game data from Firebase:", normalizedGame);
                // @ts-ignore - observers is deprecated but useful for debugging
                console.log("gameData$ feliratkozók száma:", this.gameDataSubject.observers?.length ?? 0);
                this.gameDataSubject.next(normalizedGame);
            }
        });
    }
    public unsubscribeFromGame(): void {
        if (this.firebaseUnsubscribe) {
        this.firebaseUnsubscribe();
        this.firebaseUnsubscribe = null;
        }
    }
}
export const gameStateManagementService = GameStateService.getInstance();


