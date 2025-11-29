import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useParams, useLocation } from "react-router-dom";
import { ref, onValue, update, DataSnapshot } from "firebase/database";
import { db, auth } from "@/lib/firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import type { Square, Game, MoveHistoryType } from "../types/index";
import MoveHistory from "./MoveHistory";
import { ChatBox } from "@/features/chat";
import GameEndModal from "../modals/GameEndModal";
import ConfirmSurrenderModal from "../modals/ConfirmSurrenderModal";
import DrawOfferModal from "../modals/DrawOfferModal";
import { PlayerInfoWithClock } from "@/features/player";
import ChessboardWrapper from "./ChessboardWrapper";
import GameActionButtons from "./GameActionButtons";
import type { GameSettings } from "@/features/lobby";
import { gameService } from "../services/gameService";
import { playerService } from "@/features/player/services/playerService";
import { useGameInitializer } from "../hooks/useGameInitializer";
import { getGameLayout, getPlayerEloData } from "../utils/gameLayoutHelpers";

export default function ChessGame() {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const gameSettings = (location.state as { gameSettings: GameSettings })?.gameSettings;
    
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [moveFrom, setMoveFrom] = useState<"" | Square>("");
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Square; to: Square } | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryType[]>([]);
    const [gameData, setGameData] = useState<Game | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(null);
    const currentTurn = chessGame.turn() === "w" ? "white" : "black";
    const [timeLeft, setTimeLeft] = useState<{ white: number; black: number }>({
        white: 5 * 60 * 1000, // Alapértelmezett, amíg be nem töltődik
        black: 5 * 60 * 1000,
    });
    const [prevStatus, setPrevStatus] = useState(gameData?.status);

    const [showEndModal, setShowEndModal] = useState(false);
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
    const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);

    // Auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);

    //Create game if not exists
    useGameInitializer(gameId, gameSettings, currentUser);

    // Join game if not already joined
    useEffect(() => {
        if (!gameId || !currentUser) return;

        playerService.joinGame(gameId, currentUser)
            .catch(error => console.error("Error joining game:", error));
    }, [gameId, currentUser]);

    // Game listener
    useEffect(() => {
        if (!gameId || !currentUser) return;

        const gameRef = ref(db, `games/${gameId}`);
        const unsubscribe = onValue(gameRef, handleGameUpdate);

        return () => unsubscribe();
    }, [gameId, currentUser]);
    function handleGameUpdate(snap: DataSnapshot) {
        const game: Game = snap.val();
        if (!game) return;

        // Pozíció szinkronizálás
        setViewingHistoryIndex(null);
        setChessPosition(game.fen);
        // Utolsó lépés kiemelése
        setLastMoveSquares(
            game.lastMove ? { from: game.lastMove.from, to: game.lastMove.to } : null
        );
        chessGame.load(game.fen);
        
        
        // Idő számítása
        if (game.timeLeft) {
            const elapsed = game.status === "ongoing" ? Date.now() - game.updatedAt : 0;
            const currentTurnSide = chessGame.turn() === "w" ? "white" : "black";
            
            setTimeLeft({
                ...game.timeLeft,
                [currentTurnSide]: Math.max(0, game.timeLeft[currentTurnSide] - elapsed),
            });
        }
        // Játék adatok és lépéstörténet mentése
        setGameData(game);
        setMoveHistory(game.moves || []);
        
    }

    // Játék vége modal megjelenítése
    useEffect(() => {
        if (!gameData) return;

        // Játék vége modal megjelenítése mindenkinek (játékosoknak és nézőknek is)
        if (gameData.status === "ended" && !showEndModal && prevStatus !== "ended") {
            setShowEndModal(true);
        }
        setPrevStatus(gameData.status);

    }, [gameData?.status, showEndModal, prevStatus]);

    // Döntetlen ajánlat figyelése
    useEffect(() => {
        if (!gameData || !currentUser) return;

        // Ha valaki felajánlotta a döntetlent ÉS nem én voltam az
        if (gameData.drawOfferedBy && gameData.drawOfferedBy !== currentUser.uid) {
            setDrawOfferedBy(gameData.drawOfferedBy);
            setShowDrawOfferModal(true);
        } else if (!gameData.drawOfferedBy) {
            // Ha nincs ajánlat, bezárjuk a modalt
            setShowDrawOfferModal(false);
            setDrawOfferedBy(null);
        }
    }, [gameData?.drawOfferedBy, currentUser]);

    function handleNewGame() {
        console.log("Új játék indítása...");
        // TODO: Implementálni később
    }

    function handleRematch() {
        console.log("Visszavágó indítása...");
        // TODO: Implementálni később
    }
    function isMyPiece(square: Square) {
        const piece = chessGame.get(square);
        if (!piece) return false;
        if (!currentUser || !gameData?.players) return false;
        
        // Service-t használjuk a játékos oldalának meghatározására
        const mySide = playerService.getPlayerSide(currentUser, gameData);
        if (!mySide) return false;
        
        const mySideColor = mySide === "white" ? "w" : "b";
        return piece.color === mySideColor;
    }

    function getRemainingTime(side: "white" | "black") {
        if (!gameData) return 0;
        
        // Service-t használjuk az idő kiszámítására
        const currentTurnSide = chessGame.turn() === "w" ? "white" : "black";
        return playerService.getRemainingTime(side, gameData, currentTurnSide);
    }

    function canMove() {
        if (!currentUser || !gameData?.players) return false;

        // Ellenőrizd, hogy mindkét játékos csatlakozott-e
        if (!gameData.players.white || !gameData.players.black) return false;

        // Service-t használjuk a játékos oldalának meghatározására
        const mySide = playerService.getPlayerSide(currentUser, gameData);

        if (!mySide) return false;

        // Ellenőrizd az időt valós időben
        if (getRemainingTime(mySide) <= 0) return false;

        // Ellenőrizd, hogy a játék folyamatban van
        if (gameData?.status === "ended") return false;

        // Ellenőrizd, hogy a soron következő játékos vagy-e
        if ((chessGame.turn() === "w" ? "white" : "black") !== mySide) return false;

        return true;
    }
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
                    chessGame.get(m.to) && chessGame.get(m.to)?.color !== chessGame.get(square)?.color
                        ? "radial-gradient(circle, rgba(0, 0, 0, 0.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0, 0, 0, 0.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
        }
        newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
        setOptionSquares(newSquares);
        return true;
    }

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
        if (!canMove()) return;
        // Ha történetet nézünk, ne engedjük a lépést
        if (viewingHistoryIndex !== null) return;

        if (piece && !isMyPiece(square as Square)) return;
        if (moveFrom && !isMyPiece(moveFrom)) return;

        if (moveFrom === square) {
            setMoveFrom("");
            setOptionSquares({});
            return;
        }

        if (!moveFrom && piece) {
            const has = getMoveOptions(square as Square);
            if (has) setMoveFrom(square as Square);
            return;
        }

        const moves = chessGame.moves({ square: moveFrom as Square, verbose: true });
        const found = moves.find((m) => m.from === moveFrom && m.to === square);

        if (!found) {
            const has = getMoveOptions(square as Square);
            setMoveFrom(has ? (square as Square) : "");
            return;
        }

        try {
            const move = chessGame.move({ from: moveFrom as Square, to: square as Square, promotion: "q" });
            if (!move) return false;
            const newFen = chessGame.fen();
            setChessPosition(newFen);
            setLastMoveSquares({ from: moveFrom as Square, to: square as Square });
            gameService.updateGameInDb(gameId!, gameData!, chessGame, newFen, move);
            setMoveFrom("");
            setOptionSquares({});
        } catch {
            const has = getMoveOptions(square as Square);
            setMoveFrom(has ? (square as Square) : "");
            return;
        }
    }

    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
        if (!canMove()) return false;
        // Ha történetet nézünk, ne engedjük a lépést
        if (viewingHistoryIndex !== null) return false;

        if (!isMyPiece(sourceSquare as Square)) return false;
        if (!targetSquare) return false;

        try {
            if (!gameService.isLegalMove(chessGame, sourceSquare, targetSquare)) return false;            
            const move = gameService.move(chessGame, sourceSquare, targetSquare);
            if (!move) return false;
            gameService.updateGameInDb(gameId!, gameData!, chessGame, chessGame.fen(), move);
            setChessPosition(chessGame.fen());
            setLastMoveSquares({ from: sourceSquare as Square, to: targetSquare as Square });
            setOptionSquares({});
            setMoveFrom("");
            return true;
        } catch {
            return false;
        }
    }

    // Történet navigáció
    function viewMove(index: number) {
        if (index < 0 || index >= moveHistory.length) return;

        const move = moveHistory[index];
        const tempGame = new Chess();
        tempGame.load(move.fen);

        setChessPosition(move.fen);
        setLastMoveSquares({ from: move.from as Square, to: move.to as Square });
        setViewingHistoryIndex(index);
        setOptionSquares({});
        setMoveFrom("");
    }

    function goToLatestPosition() {
        if (!gameData) return;

        chessGame.load(gameData.fen);
        setChessPosition(gameData.fen);

        if (gameData.lastMove) {
            setLastMoveSquares({ from: gameData.lastMove.from, to: gameData.lastMove.to });
        }

        setViewingHistoryIndex(null);
        setOptionSquares({});
        setMoveFrom("");
    }
    async function handleOfferDraw() {
        if (!canMove() || !gameId || !gameData || gameData.status === "ended" || !currentUser) return;
        console.log("Döntetlen ajánlás...");
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            // Csak beállítjuk, hogy ki ajánlotta fel a döntetlent
            await update(gameRef, {
                drawOfferedBy: currentUser.uid,
            });
            
            console.log("Draw offered by:", currentUser.uid);
        } catch (err) {
            console.error("Error offering draw:", err);
        }
    }

    async function handleAcceptDraw() {
        if (!gameId || !gameData) return;
        console.log("Döntetlen elfogadása...");
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            await update(gameRef, {
                status: "ended",
                winner: "draw",
                winReason: "aggreement",
                drawOfferedBy: null, // Töröljük az ajánlatot
            });
            
            console.log("Draw accepted!");
            
            // Frissítjük a Firestore-t
            await gameService.updateFirestoreOnGameEnd(gameId, gameData, "draw");
            
            setShowDrawOfferModal(false);
            setShowEndModal(true);
        } catch (err) {
            console.error("Error accepting draw:", err);
        }
    }

    async function handleDeclineDraw() {
        if (!gameId) return;
        console.log("Döntetlen elutasítása...");
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            // Töröljük az ajánlatot
            await update(gameRef, {
                drawOfferedBy: null,
            });
            
            setShowDrawOfferModal(false);
            console.log("Draw declined");
        } catch (err) {
            console.error("Error declining draw:", err);
        }
    }

    async function handleAbort() {
        if (!gameId || !gameData || gameData.status === "ended" || !currentUser) return;
        
        // Csak 0-1 lépés esetén lehet megszakítani
        if (moveHistory.length > 1) return;
        
        console.log("Játék megszakítása...");
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            // Játék befejezése döntetlenként, DE ELO változás nélkül
            const now = Date.now();
            await update(gameRef, {
                status: "ended",
                winner: "draw",
                winReason: "aborted",
                updatedAt: now,
            });
            
            console.log("Game aborted without ELO changes");
            
            // NEM frissítjük a Firestore-t (nincs ELO változás)
            setShowEndModal(true);
        } catch (err) {
            console.error("Error aborting game:", err);
        }
    }

    async function handleSurrender() {
        // Ellenőrizzük, hogy játékos vagy-e és a játék nem ért-e véget
        if (!currentUser || !gameData?.players || gameData.status === "ended") return;
        
        // Service-t használjuk a játékos oldalának meghatározására
        const mySide = playerService.getPlayerSide(currentUser, gameData);
        
        // Csak játékos adhatja fel a játékot (nem néző)
        if (!mySide) return;
        
        // Megerősítő modal megnyitása
        setShowSurrenderConfirm(true);
    }
    
    async function confirmSurrender() {
        if (!gameId || !gameData || !currentUser) return;
        
        // Modal bezárása azonnal
        setShowSurrenderConfirm(false);
        
        console.log("Megadás...");
        
        const gameRef = ref(db, `games/${gameId}`);
        
        // Service-t használjuk a játékos oldalának meghatározására
        const mySide = playerService.getPlayerSide(currentUser, gameData);
        if (!mySide) return;
        
        const winner = mySide === "white" ? "black" : "white";
        
        try {
            await update(gameRef, {
                status: "ended",
                winner,
                winReason: "resignation",
            });
            
            console.log(`${mySide} surrendered, ${winner} wins!`);
            
            // Frissítjük a Firestore-t
            await gameService.updateFirestoreOnGameEnd(gameId, gameData, winner);
            
            setShowEndModal(true);
        } catch (err) {
            console.error("Error updating game on surrender:", err);
        }
    }
    // Callback amikor lejár valamelyik játékos ideje
    async function handleTimeExpired(side: "white" | "black") {
        if (!gameId || !gameData || gameData.status === "ended") return;

        const gameRef = ref(db, `games/${gameId}`);
        const winner = side === "white" ? "black" : "white";

        try {
            await update(gameRef, {
                status: "ended",
                winner,
                winReason: "timeout"
            });
            
            console.log(`Time expired for ${side}, ${winner} wins!`);
            
            // Frissítjük a Firestore-t
            await gameService.updateFirestoreOnGameEnd(gameId, gameData, winner);
            
            setShowEndModal(true);
        } catch (err) {
            console.error("Error updating game on timeout:", err);
        }
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
                                    currentUserName={
                                        currentUser.displayName ||
                                        currentUser.email?.split('@')[0] ||
                                        (gameData?.players?.white?.uid === currentUser.uid
                                            ? (gameData.players.white.displayName || gameData.players.white.email?.split('@')[0] || "Játékos")
                                            : gameData?.players?.black?.uid === currentUser.uid
                                            ? (gameData.players.black.displayName || gameData.players.black.email?.split('@')[0] || "Játékos")
                                            : "Játékos")
                                    }
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
                opponentName={
                    gameData?.players?.white?.uid === drawOfferedBy
                        ? (gameData.players.white.displayName || gameData.players.white.email?.split('@')[0] || "Ellenfél")
                        : gameData?.players?.black?.uid === drawOfferedBy
                        ? (gameData.players.black.displayName || gameData.players.black.email?.split('@')[0] || "Ellenfél")
                        : "Ellenfél"
                }
                onAccept={handleAcceptDraw}
                onDecline={handleDeclineDraw}
            />
        </>
    );
}