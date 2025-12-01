import { useObservable } from '@/shared';
import { gameStateService, type Game } from '..';
import { distinctUntilChanged, map } from 'rxjs';

export function useGamePropSelector<T>(
  selector: (game: Game) => T,
  defaultValue: T
): T {
  return useObservable(
    gameStateService.gameData$.pipe(map(selector), distinctUntilChanged()),
    defaultValue
  );
}
