import { useEffect, useRef, useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import type { Square } from '../types/index';
import MoveHistory from './MoveHistory';
import { ChatBox } from '@/features/chat';
import { PlayerInfoWithClock } from '@/features/player';
import ChessboardWrapper from './ChessboardWrapper';
import GameActionButtons from './GameActionButtons';
import { GameBackgroundDecoration } from './GameBackgroundDecoration';
import type { GameSettings } from '@/features/lobby';
import { playerService } from '@/features/player/services/playerService';
import { useGameInitializer } from '../hooks/useGameInitializer';
import { useGameSubscription } from '../hooks/useGameSubscription';
import { useChessGameLogic } from '../hooks/useChessGameLogic';
import { getBoardOrientation } from '../utils/gameLayoutHelpers';

/** Main chess game component handling game logic, UI, and Firebase synchronization */
export default function ChessGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const gameSettings = (location.state as { gameSettings: GameSettings })
    ?.gameSettings;

  const chessGame = useRef(new Chess()).current;

  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [lastMoveSquares, setLastMoveSquares] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const { user: currentUser } = useAuth();
  /** When not null, user is viewing a historical position instead of live game */
  const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(
    null
  );

  useGameInitializer(gameId, gameSettings, currentUser);
  useEffect(() => {
    if (!gameId || !currentUser) return;

    playerService
      .joinGame(gameId, currentUser)
      .catch((error) => console.error('Error joining game:', error));
  }, [gameId, currentUser]);

  const renderMove = useCallback(
    (
      fen: string,
      from?: Square,
      to?: Square,
      index: number | null = null
    ) => {
      setChessPosition(fen);
      if (from && to) {
        setLastMoveSquares({ from, to });
      }
      setViewingHistoryIndex(index);
    },
    []
  );

  const { gameData } = useGameSubscription(gameId, chessGame, renderMove);

  const { optionSquares, onSquareClick, onPieceDrop, clearSelection } =
    useChessGameLogic(
      chessGame,
      gameId,
      gameData,
      currentUser,
      viewingHistoryIndex,
      renderMove
    );

  // Clear piece selection when position changes (e.g., opponent moves)
  useEffect(() => {
    clearSelection();
  }, [chessPosition, clearSelection]);

  /** Navigates to a historical position for review (doesn't affect actual game) */
  function viewMove(index: number) {
    if (!gameData || !gameData.moves) return;
    if (index < 0 || index >= gameData.moves.length) return;

    const move = gameData.moves[index];
    renderMove(move.fen, move.from as Square, move.to as Square, index);
  }

  function goToLatestPosition() {
    if (!gameData) return;
    chessGame.load(gameData.fen);
    renderMove(gameData.fen, gameData.lastMove?.from, gameData.lastMove?.to);
  }

  const boardOrientation = getBoardOrientation(currentUser, gameData);

  const combinedSquareStyles = {
    ...optionSquares,
    ...(lastMoveSquares
      ? {
          [lastMoveSquares.from]: { background: 'rgba(153, 204, 22, 0.4)' },
          [lastMoveSquares.to]: { background: 'rgba(153, 204, 22, 0.4)' },
        }
      : {}),
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900 min-w-full flex flex-col">
        <GameBackgroundDecoration />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:h-screen gap-4 p-3 lg:p-4">
          <div className="flex flex-col lg:flex-[2] gap-3">
            <PlayerInfoWithClock position="top" />
            <ChessboardWrapper
              position={chessPosition}
              onSquareClick={onSquareClick}
              onPieceDrop={onPieceDrop}
              squareStyles={combinedSquareStyles}
              boardOrientation={boardOrientation}
              viewingHistoryIndex={viewingHistoryIndex}
              gameData={gameData}
            />
            <PlayerInfoWithClock position="bottom" />
          </div>
          <div className="flex flex-col lg:flex-1 gap-3 w-full lg:w-auto">
            <div className="flex-1 min-h-0">
              <MoveHistory
                viewingHistoryIndex={viewingHistoryIndex}
                onViewMove={viewMove}
                onGoToLatest={goToLatestPosition}
              />
            </div>
            <GameActionButtons />
            <div className="flex-1 min-h-0">
              <ChatBox />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
