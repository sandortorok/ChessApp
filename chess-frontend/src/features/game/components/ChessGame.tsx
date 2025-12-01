import React, { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { useParams, useLocation } from 'react-router-dom';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import type { Square } from '../types/index';
import MoveHistory from './MoveHistory';
import { ChatBox } from '@/features/chat';
import { PlayerInfoWithClock } from '@/features/player';
import ChessboardWrapper from './ChessboardWrapper';
import GameActionButtons from './GameActionButtons';
import { GameBackgroundDecoration } from './GameBackgroundDecoration';
import type { GameSettings } from '@/features/lobby';
import { gameService } from '../services/gameService';
import { playerService } from '@/features/player/services/playerService';
import { useGameInitializer } from '../hooks/useGameInitializer';
import { getBoardOrientation } from '../utils/gameLayoutHelpers';
import { gameStateManagementService } from '../services/gameStateManagement';
import { useGamePropSelector, DEFAULT_GAME } from '..';

/** Main chess game component handling game logic, UI, and Firebase synchronization */
export default function ChessGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const gameSettings = (location.state as { gameSettings: GameSettings })
    ?.gameSettings;

  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  // const [gameData, setGameData] = useState<Game | null>(null);
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveFrom, setMoveFrom] = useState<'' | Square>('');
  const [optionSquares, setOptionSquares] = useState<
    Record<string, React.CSSProperties>
  >({});
  const [lastMoveSquares, setLastMoveSquares] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  /** When not null, user is viewing a historical position instead of live game */
  const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(
    null
  );

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  // Create game if not exists
  useGameInitializer(gameId, gameSettings, currentUser);

  // Join game if not already joined
  useEffect(() => {
    if (!gameId || !currentUser) return;

    playerService
      .joinGame(gameId, currentUser)
      .catch((error) => console.error('Error joining game:', error));
  }, [gameId, currentUser]);

  // Create Game Subscription
  useEffect(() => {
    if (!gameId || !currentUser) return;
    gameStateManagementService.createFirebaseSubscription(gameId);

    return () => {};
  }, [gameId, currentUser]);

  //Subscribe to game changes
  const gameData = useGamePropSelector((game) => game, DEFAULT_GAME);

  //On Game Data change
  useEffect(() => {
    if (!gameData) return;
    chessGame.load(gameData.fen);
    renderMove(gameData.fen, gameData.lastMove?.from, gameData.lastMove?.to);
  }, [gameData]);

  function isMyPiece(square: Square) {
    const piece = chessGame.get(square);
    if (!piece) return false;
    if (!currentUser || !gameData?.players) return false;

    // Use service to determine player side
    const mySide = playerService.getPlayerSide(currentUser, gameData.players);
    if (!mySide) return false;

    const mySideColor = mySide === 'white' ? 'w' : 'b';
    return piece.color === mySideColor;
  }
  /** Validates if current user can make a move (checks turn, time, players joined, game status) */
  function canMove() {
    if (!currentUser || !gameData?.players || gameData?.status === 'ended')
      return false;

    // Check if both players joined
    if (!gameData.players.white || !gameData.players.black) return false;

    // determine player side
    const mySide = playerService.getPlayerSide(currentUser, gameData.players);
    if (!mySide) return false;

    // Check if it's my turn
    if ((chessGame.turn() === 'w' ? 'white' : 'black') !== mySide) return false;

    // Check time in real-time
    if (playerService.getRemainingTime(mySide, gameData) <= 0) return false;

    return true;
  }
  /** Highlights legal moves for a piece (different styles for captures vs normal moves) */
  function getMoveOptions(square: Square) {
    const moves = chessGame.moves({ square, verbose: true });
    if (!moves || moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};
    for (const m of moves) {
      newSquares[m.to] = {
        background:
          chessGame.get(m.to) &&
          chessGame.get(m.to)?.color !== chessGame.get(square)?.color
            ? 'radial-gradient(circle, rgba(0, 0, 0, 0.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    }
    newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };
    setOptionSquares(newSquares);
    return true;
  }
  /** Handles click-based move input (select piece ΓåÆ click destination) */
  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (!canMove() || viewingHistoryIndex !== null) return;
    if (piece && !isMyPiece(square as Square)) return;
    if (moveFrom && !isMyPiece(moveFrom)) return;

    if (moveFrom === square) {
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    if (!moveFrom && piece) {
      const has = getMoveOptions(square as Square);
      if (has) setMoveFrom(square as Square);
      return;
    }

    const moves = chessGame.moves({
      square: moveFrom as Square,
      verbose: true,
    });
    const found = moves.find((m) => m.from === moveFrom && m.to === square);

    if (!found) {
      const has = getMoveOptions(square as Square);
      setMoveFrom(has ? (square as Square) : '');
      return;
    }

    try {
      const move = chessGame.move({
        from: moveFrom as Square,
        to: square as Square,
        promotion: 'q',
      });
      if (!move) return false;
      const newFen = chessGame.fen();
      renderMove(newFen, move.from, move.to);
      gameService.updateGameInDb(gameId!, gameData!, chessGame, newFen, move);
    } catch {
      const has = getMoveOptions(square as Square);
      setMoveFrom(has ? (square as Square) : '');
      return;
    }
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!canMove()) return false;
    // Don't allow moves while viewing history
    if (viewingHistoryIndex !== null) return false;

    if (!isMyPiece(sourceSquare as Square)) return false;
    if (!targetSquare) return false;

    try {
      const move = gameService.move(chessGame, sourceSquare, targetSquare);
      if (!move) return false;
      gameService.updateGameInDb(
        gameId!,
        gameData!,
        chessGame,
        chessGame.fen(),
        move
      );
      renderMove(chessGame.fen(), move.from, move.to);
      return true;
    } catch {
      return false;
    }
  }
  function renderMove(
    fen: string,
    from?: Square,
    to?: Square,
    index: number | null = null
  ) {
    setChessPosition(fen);
    if (from && to) {
      setLastMoveSquares({ from, to });
    }
    setViewingHistoryIndex(index);
    setOptionSquares({});
    setMoveFrom('');
  }
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

  // Game layout helpers
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
          {/* Bal oszlop: PlayerInfo - Chessboard - PlayerInfo */}
          <div className="flex flex-col lg:flex-[2] gap-3">
            {/* Felső játékos */}
            <PlayerInfoWithClock position="top" />
            {/* Sakktábla */}
            <ChessboardWrapper
              position={chessPosition}
              onSquareClick={onSquareClick}
              onPieceDrop={onPieceDrop}
              squareStyles={combinedSquareStyles}
              boardOrientation={boardOrientation}
              viewingHistoryIndex={viewingHistoryIndex}
              gameData={gameData}
            />
            {/* Alsó játékos */}
            <PlayerInfoWithClock position="bottom" />
          </div>
          {/* Jobb oszlop: ViewHistory - Gombok - ChatBox */}
          <div className="flex flex-col lg:flex-1 gap-3 w-full lg:w-auto">
            {/* Lépéstörténet */}
            <div className="flex-1 min-h-0">
              <MoveHistory
                viewingHistoryIndex={viewingHistoryIndex}
                onViewMove={viewMove}
                onGoToLatest={goToLatestPosition}
              />
            </div>
            <GameActionButtons />
            {/* Chat Box */}
            <div className="flex-1 min-h-0">
              <ChatBox />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
