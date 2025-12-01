import { BehaviorSubject } from 'rxjs';
import { ref, onValue, type Unsubscribe } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import type { Game } from '@/features/game';
import { DEFAULT_GAME } from '../constants/gameDefaults';

/**
 * Service managing game state through RxJS observables
 * Provides reactive access to current game data and handles Firebase subscriptions
 */
class GameStateService {
  private static instance: GameStateService | null = null;
  private firebaseUnsubscribe: Unsubscribe | null = null;

  private constructor() {}
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
        // Firebase Realtime Database doesn't persist empty arrays
        const normalizedGame: Game = {
          ...game,
          moves: game.moves ?? [],
        };
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
export const gameStateService = GameStateService.getInstance();
