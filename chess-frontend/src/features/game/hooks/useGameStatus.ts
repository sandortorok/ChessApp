import { useObservable } from '@/shared';
import { DEFAULT_GAME, gameStateService, type Status } from '..';
import { distinctUntilChanged, map } from 'rxjs';

export function useGameStatus(): Status {
  return useObservable(
    gameStateService.gameData$.pipe(
      map((gameData) => gameData.status),
      distinctUntilChanged()
    ),
    DEFAULT_GAME.status
  );
}
