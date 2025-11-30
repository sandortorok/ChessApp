import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import MoveHistory from "./MoveHistory";
import { ChatBox } from "@/features/chat";
import GameEndModal from "../modals/GameEndModal";
import ConfirmSurrenderModal from "../modals/ConfirmSurrenderModal";
import DrawOfferModal from "../modals/DrawOfferModal";
import { PlayerInfoWithClock } from "@/features/player";
import ChessboardWrapper from "./ChessboardWrapper";
import GameActionButtons from "./GameActionButtons";
import type { GameSettings } from "@/features/lobby";
import { playerService } from "@/features/player/services/playerService";
import { 
    useGameInitializer, 
    useGameState, 
    useChessLogic, 
    useMoveHandlers, 
    useGameActions, 
    useHistoryNavigation 
} from "../hooks";
import { getGameLayout, getPlayerEloData } from "../utils/gameLayoutHelpers";

/** Main chess game component handling game logic, UI, and Firebase synchronization */
export default function ChessGame() {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const gameSettings = (location.state as { gameSettings: GameSettings })?.gameSettings;

    // Modal states
    const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(null);
    const [prevStatus, setPrevStatus] = useState<string | undefined>(undefined);
    const [showEndModal, setShowEndModal] = useState(false);
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
    const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);

    // Core game state
    const {
        chessGame,
        chessPosition,
        setChessPosition,
        lastMoveSquares,
        setLastMoveSquares,
        moveHistory,
        gameData,
        currentUser,
        timeLeft,
        currentTurn,
    } = useGameState(gameId);

    // Game logic
    const { canMove, isMyPiece, getMoveOptions } = useChessLogic({
        chessGame,
        currentUser,
        gameData,
        viewingHistoryIndex,
    });

    // Move handlers
    const { optionSquares, onSquareClick, onPieceDrop, clearSelection } = useMoveHandlers({
        chessGame,
        gameId,
        gameData,
        canMove,
        isMyPiece,
        getMoveOptions,
        setChessPosition,
        setLastMoveSquares,
    });

    // Game actions
    const {
        handleOfferDraw,
        handleAcceptDraw,
        handleDeclineDraw,
        handleAbort,
        handleSurrender: handleSurrenderAction,
        handleTimeExpired,
    } = useGameActions({
        gameId,
        gameData,
        currentUser,
        moveHistoryLength: moveHistory.length,
        onShowEndModal: () => setShowEndModal(true),
    });

    // History navigation
    const { viewMove, goToLatestPosition } = useHistoryNavigation({
        moveHistory,
        gameData,
        chessGame,
        setChessPosition,
        setLastMoveSquares,
        setViewingHistoryIndex,
        clearSelection,
    });

    // Create game if not exists
    useGameInitializer(gameId, gameSettings, currentUser);

    // Join game if not already joined
    useEffect(() => {
        if (!gameId || !currentUser) return;

        playerService.joinGame(gameId, currentUser)
            .catch(error => console.error("Error joining game:", error));
    }, [gameId, currentUser]);

    // Show game end modal
    useEffect(() => {
        if (!gameData) return;

        if (gameData.status === "ended" && !showEndModal && prevStatus !== "ended") {
            setShowEndModal(true);
        }
        setPrevStatus(gameData.status);
    }, [gameData?.status, showEndModal, prevStatus]);

    // Listen for draw offers
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

    /** @todo Implement new game flow */
    function handleNewGame() {
        console.log("Starting new game...");
    }

    /** @todo Implement rematch logic */
    function handleRematch() {
        console.log("Starting rematch...");
    }

    function handleSurrender() {
        if (!currentUser || !gameData?.players || gameData.status === "ended") return;
        
        const mySide = playerService.getPlayerSide(currentUser, gameData);
        if (!mySide) return;
        
        setShowSurrenderConfirm(true);
    }
    
    async function confirmSurrender() {
        setShowSurrenderConfirm(false);
        await handleSurrenderAction();
    }

    // Game layout helpers
    const { boardOrientation, topPlayer, bottomPlayer, topPlayerColor, bottomPlayerColor } =
        getGameLayout(currentUser, gameData);

    const topPlayerElo = getPlayerEloData(gameData, topPlayerColor, topPlayer);
    const bottomPlayerElo = getPlayerEloData(gameData, bottomPlayerColor, bottomPlayer);

    const combinedSquareStyles = {
        ...optionSquares,
        ...(lastMoveSquares
            ? {
                [lastMoveSquares.from]: { background: "rgba(20, 184, 166, 0.4)" },
                [lastMoveSquares.to]: { background: "rgba(20, 184, 166, 0.4)" },
            }
            : {}),
    };

    const opponentName = gameData?.players?.white?.uid === drawOfferedBy
        ? (gameData.players.white.displayName || gameData.players.white.email?.split('@')[0] || "Ellenfél")
        : gameData?.players?.black?.uid === drawOfferedBy
        ? (gameData.players.black.displayName || gameData.players.black.email?.split('@')[0] || "Ellenfél")
        : "Ellenfél";

    const currentUserName = currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        (gameData?.players?.white?.uid === currentUser?.uid
            ? (gameData?.players?.white?.displayName || gameData?.players?.white?.email?.split('@')[0] || "Játékos")
            : gameData?.players?.black?.uid === currentUser?.uid
            ? (gameData?.players?.black?.displayName || gameData?.players?.black?.email?.split('@')[0] || "Játékos")
            : "Játékos");

    return (
        <>
            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900 min-w-full flex flex-col">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.15),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.15),transparent_50%)]" />
                </div>

                {/* Floating chess pieces */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                    <div className="absolute top-20 left-10 text-6xl animate-float">♔</div>
                    <div className="absolute top-40 right-20 text-5xl animate-float delay-1000">♕</div>
                    <div className="absolute bottom-32 left-1/4 text-7xl animate-float delay-2000">♖</div>
                    <div className="absolute bottom-20 right-1/3 text-6xl animate-float delay-3000">♗</div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:h-screen gap-4 p-3 lg:p-4">
                    {/* Bal oszlop: PlayerInfo - Chessboard - PlayerInfo */}
                    <div className="flex flex-col lg:flex-[2] gap-3">
                        {/* Felső játékos */}
                        <PlayerInfoWithClock
                            color={topPlayerColor}
                            player={topPlayer ?? null}
                            position="top"
                            startingElo={topPlayerElo.startingElo}
                            currentElo={topPlayerElo.currentElo}
                            eloChange={topPlayerElo.eloChange}
                            initialTime={timeLeft[topPlayerColor]}
                            active={currentTurn === topPlayerColor && gameData?.status !== "ended" && gameData?.status !== "waiting"}
                            onTimeExpired={() => handleTimeExpired(topPlayerColor)}
                        />

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
                        <PlayerInfoWithClock
                            color={bottomPlayerColor}
                            player={bottomPlayer ?? null}
                            position="bottom"
                            startingElo={bottomPlayerElo.startingElo}
                            currentElo={bottomPlayerElo.currentElo}
                            eloChange={bottomPlayerElo.eloChange}
                            initialTime={timeLeft[bottomPlayerColor]}
                            active={currentTurn === bottomPlayerColor && gameData?.status !== "ended" && gameData?.status !== "waiting"}
                            onTimeExpired={() => handleTimeExpired(bottomPlayerColor)}
                        />
                    </div>

                    {/* Jobb oszlop: ViewHistory - Gombok - ChatBox */}
                    <div className="flex flex-col lg:flex-1 gap-3 w-full lg:w-auto">
                        {/* Lépéstörténet */}
                        <div className="flex-1 min-h-0">
                            <MoveHistory
                                moveHistory={moveHistory}
                                viewingHistoryIndex={viewingHistoryIndex}
                                onViewMove={viewMove}
                                onGoToLatest={goToLatestPosition}
                            />
                        </div>

                        {/* Game action buttons */}
                        {gameData?.status !== "ended" && (
                            <GameActionButtons
                                moveHistoryLength={moveHistory.length}
                                onAbort={handleAbort}
                                onOfferDraw={handleOfferDraw}
                                onSurrender={handleSurrender}
                            />
                        )}

                        {/* Chat Box */}
                        <div className="flex-1 min-h-0">
                            {gameId && currentUser?.uid && (
                                <ChatBox
                                    gameId={gameId}
                                    currentUserId={currentUser.uid}
                                    currentUserName={currentUserName}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
            <DrawOfferModal
                isOpen={showDrawOfferModal && !!drawOfferedBy}
                opponentName={opponentName}
                onAccept={handleAcceptDraw}
                onDecline={handleDeclineDraw}
            />
        </>
    );
}