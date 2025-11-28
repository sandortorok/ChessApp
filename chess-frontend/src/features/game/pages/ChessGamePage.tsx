/**
 * ChessGamePage
 * Smart component that uses the useChessGame hook
 */

import { useParams, useLocation } from "react-router-dom";
import ChessGameView from "../../../ChessGameView";
import GameEndModal from "../../../components/GameEndModal";
import ConfirmSurrenderModal from "../../../components/ConfirmSurrenderModal";
import DrawOfferModal from "../../../components/DrawOfferModal";
import type { GameSettings } from "../../../components/CreateGameModal";
import { useChessGame } from "../hooks/useChessGame";
import { getPlayerDisplayName } from "../../../shared/utils";

export default function ChessGamePage() {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const gameSettings = (location.state as { gameSettings?: GameSettings })?.gameSettings;

    const {
        gameData,
        currentUser,
        chessPosition,
        optionSquares,
        lastMoveSquares,
        moveHistory,
        viewingHistoryIndex,
        timeLeft,
        currentTurn,
        showEndModal,
        winReason,
        eloChanges,
        showSurrenderConfirm,
        showDrawOfferModal,
        drawOfferedBy,
        onSquareClick,
        onPieceDrop,
        viewMove,
        goToLatestPosition,
        handleTimeExpired,
        handleOfferDraw,
        handleAbort,
        handleSurrender,
        confirmSurrender,
        handleAcceptDraw,
        handleDeclineDraw,
        handleNewGame,
        handleRematch,
        setShowEndModal,
        setShowSurrenderConfirm
    } = useChessGame({ gameId, gameSettings });

    return (
        <>
            <ChessGameView
                chessPosition={chessPosition}
                optionSquares={optionSquares}
                lastMoveSquares={lastMoveSquares}
                players={gameData?.players || null}
                currentUser={currentUser}
                currentTurn={currentTurn}
                moveHistory={moveHistory}
                viewingHistoryIndex={viewingHistoryIndex}
                timeLeft={timeLeft}
                gameStatus={gameData?.status}
                startingElo={gameData?.startingElo}
                finalElo={gameData?.finalElo}
                eloChanges={eloChanges}
                gameId={gameId}
                onSquareClick={onSquareClick}
                onPieceDrop={onPieceDrop}
                onViewMove={viewMove}
                onGoToLatest={goToLatestPosition}
                onTimeExpired={handleTimeExpired}
                onOfferDraw={handleOfferDraw}
                onAbort={handleAbort}
                onSurrender={handleSurrender}
            />
            <GameEndModal
                isOpen={showEndModal}
                winner={gameData?.winner || null}
                players={gameData?.players || null}
                winReason={winReason}
                currentUser={currentUser}
                startingElo={gameData?.startingElo}
                finalElo={gameData?.finalElo}
                eloChanges={eloChanges}
                onClose={() => setShowEndModal(false)}
                onNewGame={handleNewGame}
                onRematch={handleRematch}
            />
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
            {showDrawOfferModal && drawOfferedBy && (
                <DrawOfferModal
                    opponentName={
                        gameData?.players?.white?.uid === drawOfferedBy
                            ? getPlayerDisplayName(gameData.players.white)
                            : gameData?.players?.black?.uid === drawOfferedBy
                            ? getPlayerDisplayName(gameData.players.black)
                            : "Ellenfél"
                    }
                    onAccept={handleAcceptDraw}
                    onDecline={handleDeclineDraw}
                />
            )}
        </>
    );
}
