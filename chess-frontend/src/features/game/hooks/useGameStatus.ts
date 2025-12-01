import { useObservable } from '@/shared';
import { DEFAULT_GAME, gameStateManagementService, type Status } from '..';
import { distinctUntilChanged, map } from 'rxjs';

export function useGameStatus(): Status {
  return useObservable(
    gameStateManagementService.gameData$.pipe(
      map((gameData) => gameData.status),
      distinctUntilChanged()
    ),
    DEFAULT_GAME.status
  );
}
