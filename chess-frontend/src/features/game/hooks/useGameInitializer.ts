import { useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import type { GameSettings } from '@/features/lobby';
import { playerService } from '@/features/player/services/playerService';
import type { User } from 'firebase/auth';

/** Creates game in Firebase if it doesn't exist, then joins current user */
export function useGameInitializer(
  gameId: string | undefined,
  gameSettings: GameSettings | undefined,
  user: User | null
) {
  useEffect(() => {
    if (!gameId || !user || !gameSettings) return;

    const gameRef = ref(db, `games/${gameId}`);

    get(gameRef)
      .then((snap) => {
        if (!snap.exists()) {
          console.log('No game found, creating new one.');
          createNewGame(gameId, gameSettings).then(() => {
            playerService.joinGame(gameId, user);
          });
        }
      })
      .catch((err) => console.error('Error checking game:', err));
  }, [gameId, gameSettings, user]);
}

/**
 * Create a new game in Firebase
 */
async function createNewGame(
  gameId: string,
  settings: GameSettings
): Promise<void> {
  const timeControl = settings?.timeControl || 5;
  const increment = settings?.increment || 0;
  const opponentType = settings?.opponentType || 'human';
  const initialTime = timeControl * 60 * 1000;
  const initialGame = {
    moves: [],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    lastMove: null,
    players: { white: null, black: null },
    turn: 'white',
    status: 'waiting',
    timeLeft: { white: initialTime, black: initialTime },
    timeControl: timeControl,
    increment: increment,
    opponentType: opponentType,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const gameRef = ref(db, `games/${gameId}`);
  await set(gameRef, initialGame);
}
