import { useGamePropSelector } from '../hooks/useGamePropSelector';
import GameActionButton from './GameActionButton';
import { gameStateService } from '../services/gameStateService';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import {
  ConfirmSurrenderModal,
  DEFAULT_GAME,
  DrawOfferModal,
  GameEndModal,
} from '..';
import { gameEndService } from '../services/gameEndService';
import { playerService } from '@/features/player';

export default function GameActionButtons() {
  const { user: currentUser } = useAuth();
  const gameData = useGamePropSelector((game) => game, DEFAULT_GAME);

  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
  const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);
  const [prevStatus, setPrevStatus] = useState(gameData.status);
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    const subscription = gameStateService.gameId$.subscribe((id) => {
      setGameId(id);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!gameData) return;
    if (
      gameData.status === 'ended' &&
      !showEndModal &&
      prevStatus !== 'ended'
    ) {
      setShowEndModal(true);
    }
    setPrevStatus(gameData.status);
  }, [gameData.status, showEndModal, prevStatus]);

  useEffect(() => {
    if (!gameData || !currentUser) return;

    if (gameData.drawOfferedBy && gameData.drawOfferedBy !== currentUser.uid) {
      setDrawOfferedBy(gameData.drawOfferedBy);
      setShowDrawOfferModal(true);
    } else if (!gameData.drawOfferedBy) {
      setShowDrawOfferModal(false);
      setDrawOfferedBy(null);
    }
  }, [gameData?.drawOfferedBy, currentUser]);

  async function onAbort() {
    if (!gameId || gameData.status === 'ended') return;
    if (gameData.moves.length > 1) return;

    try {
      await gameEndService.abortGame(gameId);
      console.log('Game aborted');
    } catch (err) {
      console.error('Error aborting game:', err);
    }
  }

  async function onOfferDraw() {
    if (!gameId || gameData.status === 'ended' || !currentUser) return;

    try {
      await gameEndService.offerDraw(gameId, currentUser.uid);
      console.log('Draw offered');
    } catch (err) {
      console.error('Error offering draw:', err);
    }
  }

  async function onSurrender() {
    if (
      !gameId ||
      !gameData.players ||
      gameData.status === 'ended' ||
      !currentUser
    )
      return;

    const mySide = playerService.getPlayerSide(currentUser, gameData.players);
    if (!mySide) return;

    setShowSurrenderConfirm(true);
  }

  async function confirmSurrender() {
    if (!gameId || !gameData.players || !currentUser) return;

    setShowSurrenderConfirm(false);

    const mySide = playerService.getPlayerSide(currentUser, gameData.players);
    if (!mySide) return;

    try {
      await gameEndService.surrenderGame(gameId, gameData, mySide);
      console.log(`${mySide} surrendered`);
    } catch (err) {
      console.error('Error surrendering:', err);
    }
  }

  async function handleAcceptDraw() {
    if (!gameId || !gameData) return;

    try {
      await gameEndService.acceptDraw(gameId, gameData);
      console.log('Draw accepted');
      setShowDrawOfferModal(false);
      setShowEndModal(true);
    } catch (err) {
      console.error('Error accepting draw:', err);
    }
  }

  async function handleDeclineDraw() {
    if (!gameId) return;

    try {
      await gameEndService.declineDraw(gameId);
      console.log('Draw declined');
      setShowDrawOfferModal(false);
    } catch (err) {
      console.error('Error declining draw:', err);
    }
  }

  /** @todo Implement new game flow */
  function handleNewGame() {
    console.log('Starting new game...');
  }

  /** @todo Implement rematch logic */
  function handleRematch() {
    console.log('Starting rematch...');
  }

  return (
    <div className="flex gap-3 justify-center items-center py-2">
      {gameData.moves.length <= 1 && (
        <GameActionButton
          onClick={onAbort}
          variant="orange"
          icon="⛔"
          label="Megszakítás"
        />
      )}

      {gameData.moves.length > 1 && gameData?.status !== 'ended' && (
        <>
          <GameActionButton
            onClick={onOfferDraw}
            variant="emerald"
            icon="🤝"
            label="Döntetlen"
          />
          <GameActionButton
            onClick={onSurrender}
            variant="red"
            icon="🏳️"
            label="Feladás"
          />
        </>
      )}
      <ConfirmSurrenderModal
        isOpen={showSurrenderConfirm}
        title="Feladás megerősítése"
        message="Biztosan feladod a játékot? Ez azonnal véget ér a játéknak, veszítesz és ELO pontokat veszítesz."
        confirmText="Feladom"
        cancelText="Folytatom"
        type="danger"
        onConfirm={confirmSurrender}
        onCancel={() => setShowSurrenderConfirm(false)}
      />
      <GameEndModal
        isOpen={showEndModal}
        winner={gameData?.winner || null}
        players={gameData?.players || null}
        winReason={gameData?.winReason || null}
        startingElo={gameData?.startingElo}
        finalElo={gameData?.finalElo}
        currentUser={currentUser}
        onClose={() => setShowEndModal(false)}
        onNewGame={handleNewGame}
        onRematch={handleRematch}
      />

      <DrawOfferModal
        isOpen={showDrawOfferModal && !!drawOfferedBy}
        opponentName={
          gameData?.players?.white?.uid === drawOfferedBy
            ? gameData.players.white.displayName ||
              gameData.players.white.email?.split('@')[0] ||
              'Ellenfél'
            : gameData?.players?.black?.uid === drawOfferedBy
              ? gameData.players.black.displayName ||
                gameData.players.black.email?.split('@')[0] ||
                'Ellenfél'
              : 'Ellenfél'
        }
        onAccept={handleAcceptDraw}
        onDecline={handleDeclineDraw}
      />
    </div>
  );
}
