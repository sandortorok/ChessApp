import PlayerInfo from './PlayerInfo';
import { ChessClock, useGamePropSelector, DEFAULT_GAME } from '@/features/game';
import { getPlayerInfoForPosition } from '@/features/game/utils/gameLayoutHelpers';
import { useAuth } from '@/features/auth';
import { useParams } from 'react-router-dom';
import { gameTimerService } from '@/features/game/services/gameTimerService';
import { gameEndService } from '@/features/game/services/gameEndService';

interface PlayerInfoWithClockProps {
  position: 'top' | 'bottom';
}

export default function PlayerInfoWithClock({
  position,
}: PlayerInfoWithClockProps) {
  const { gameId } = useParams<{ gameId: string }>();
  const { user: currentUser } = useAuth();
  const gameData = useGamePropSelector((game) => game, DEFAULT_GAME);

  // Get all player data for the position
  const {
    player,
    playerColor,
    startingElo,
    currentElo,
    eloChange,
    initialTime,
    active,
  } = getPlayerInfoForPosition(currentUser, gameData, position);

  // Handle time expiration - delegated to service
  async function handleTimeExpired() {
    if (!gameId || !gameData || gameData.status === 'ended') return;

    try {
      await gameTimerService.handleTimeout(gameId, gameData, playerColor);
      const winner = playerColor === 'white' ? 'black' : 'white';
      await gameEndService.finalizeGameEnd(gameId, gameData, winner);
    } catch (err) {
      console.error('Error handling timeout:', err);
    }
  }

  return (
    <div className="w-full max-w-[470px] mx-auto relative backdrop-blur-xl bg-gray-900/30 rounded-xl p-3 border border-teal-500/20 transition-all duration-300">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 pointer-events-none" />
      <div className="relative flex justify-start items-center gap-4 z-10">
        <PlayerInfo
          color={playerColor}
          player={player || null}
          position={position}
          startingElo={startingElo}
          currentElo={currentElo}
          eloChange={eloChange}
        />
        <div className="ml-auto">
          <ChessClock
            initialTime={initialTime}
            active={active}
            onTimeExpired={handleTimeExpired}
          />
        </div>
      </div>
    </div>
  );
}
