import { useObservable } from '@/shared';
import { gameStateManagementService, type Game } from '..';
import { distinctUntilChanged, map } from 'rxjs';

export function useGamePropSelector<T>(
  selector: (game: Game) => T,
  defaultValue: T
): T {
  return useObservable(
    gameStateManagementService.gameData$.pipe(
      map(selector),
      distinctUntilChanged()
    ),
    defaultValue
  );
}
