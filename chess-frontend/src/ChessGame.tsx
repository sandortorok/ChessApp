import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useParams, useLocation } from "react-router-dom";
import { ref, onValue, update, DataSnapshot } from "firebase/database";
import { db, auth } from "./firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import type { Square, Game, MoveHistoryType } from "./types";
import PlayerInfo from "./PlayerInfo";
import ChessClock from "./components/ChessClock";
import MoveHistory from "./components/moveHistory";
import ChatBox from "./components/ChatBox";
import GameEndModal from "./components/GameEndModal";
import ConfirmSurrenderModal from "./components/ConfirmSurrenderModal";
import DrawOfferModal from "./components/DrawOfferModal";
import type { GameSettings } from "./components/CreateGameModal";
import { gameService } from "./services/gameService";
import { playerService } from "./services/playerService";
import { useGameInitializer } from "./hooks/useGameInitializer";

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

    // Player joining
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
            //todo: handle elo changes if game ended
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
            //TODO handle elo changes if game ended
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

    const isWhite = currentUser?.uid === gameData?.players?.white?.uid;
    const boardOrientation = isWhite ? "white" : "black";

    const topPlayer = isWhite ? gameData?.players?.black : gameData?.players?.white;
    const bottomPlayer = isWhite ? gameData?.players?.white : gameData?.players?.black;

    const topPlayerColor = isWhite ? "black" : "white";
    const bottomPlayerColor = isWhite ? "white" : "black";

    const topPlayerStartingElo = gameData?.startingElo?.[topPlayerColor];
    const bottomPlayerStartingElo = gameData?.startingElo?.[bottomPlayerColor];

    const topPlayerCurrentElo = gameData?.finalElo?.[topPlayerColor] || gameData?.startingElo?.[topPlayerColor] || topPlayer?.elo;
    const bottomPlayerCurrentElo = gameData?.finalElo?.[bottomPlayerColor] || gameData?.startingElo?.[bottomPlayerColor] || bottomPlayer?.elo;

    const topPlayerEloChange = (gameData?.finalElo?.[topPlayerColor] && gameData?.startingElo?.[topPlayerColor])
        ? gameData.finalElo[topPlayerColor] - gameData.startingElo[topPlayerColor]
        : 0;
    const bottomPlayerEloChange = (gameData?.finalElo?.[bottomPlayerColor] && gameData?.startingElo?.[bottomPlayerColor])
        ? gameData.finalElo[bottomPlayerColor] - gameData.startingElo[bottomPlayerColor]
        : 0;

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
                        <div className="w-full max-w-[470px] mx-auto relative backdrop-blur-xl bg-gray-900/30 rounded-xl p-3 border border-teal-500/20 transition-all duration-300">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 pointer-events-none" />
                            <div className="relative flex justify-start items-center gap-4 z-10">
                                <PlayerInfo
                                    color={isWhite ? "black" : "white"}
                                    player={topPlayer ?? null}
                                    position="top"
                                    startingElo={topPlayerStartingElo}
                                    currentElo={topPlayerCurrentElo}
                                    eloChange={topPlayerEloChange}
                                />
                                <div className="ml-auto">
                                    <ChessClock
                                        initialTime={timeLeft[isWhite ? "black" : "white"]}
                                        active={currentTurn === (isWhite ? "black" : "white") && gameData?.status !== "ended" && gameData?.status !== "waiting"}
                                        onTimeExpired={() => handleTimeExpired(isWhite ? "black" : "white")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sakktábla */}
                        <div className="flex-1 w-full max-w-[470px] mx-auto relative group flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl transition-all duration-300" />
                            <div className="relative rounded-xl overflow-hidden border-2 border-teal-500/30 shadow-2xl">
                                <Chessboard
                                    options={{
                                        position: chessPosition,
                                        onSquareClick,
                                        onPieceDrop,
                                        squareStyles: combinedSquareStyles,
                                        darkSquareStyle: { backgroundColor: "#08947aff" },
                                        boardOrientation,
                                        lightSquareStyle: { backgroundColor: "#d1fae5" },
                                    }}
                                />
                            </div>
                            {viewingHistoryIndex !== null && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-70" />
                                        <div className="relative bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 text-gray-900 px-5 py-1.5 rounded-full font-bold text-xs shadow-xl border-2 border-white/30 animate-gradient">
                                            📜 Történet megtekintése
                                        </div>
                                    </div>
                                </div>
                            )}
                            {gameData?.status === "waiting" && gameData.players?.white && gameData.players?.black && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-2xl opacity-60" />
                                        <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 text-gray-900 px-8 py-3 rounded-2xl font-bold text-lg shadow-2xl border-4 border-white/40 animate-pulse">
                                            ⏳ WAITING
                                            <div className="text-xs font-normal mt-1 opacity-80">Waiting for first move...</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {gameData?.status === "waiting" && (!gameData.players?.white || !gameData.players?.black) && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-60" />
                                        <div className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-gray-900 px-8 py-3 rounded-2xl font-bold text-lg shadow-2xl border-4 border-white/40 animate-pulse">
                                            👥 WAITING FOR PLAYERS
                                            <div className="text-xs font-normal mt-1 opacity-80">
                                                {!gameData.players?.white && !gameData.players?.black && "Waiting for both players..."}
                                                {gameData.players?.white && !gameData.players?.black && "Waiting for Black player..."}
                                                {!gameData.players?.white && gameData.players?.black && "Waiting for White player..."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Alsó játékos */}
                        <div className="w-full max-w-[470px] mx-auto relative backdrop-blur-xl bg-gray-900/30 rounded-xl p-3 border border-teal-500/20 transition-all duration-300">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 pointer-events-none" />
                            <div className="relative flex justify-start items-center gap-4 z-10">
                                <PlayerInfo
                                    color={isWhite ? "white" : "black"}
                                    player={bottomPlayer ?? null}
                                    position="bottom"
                                    startingElo={bottomPlayerStartingElo}
                                    currentElo={bottomPlayerCurrentElo}
                                    eloChange={bottomPlayerEloChange}
                                />
                                <div className="ml-auto">
                                    <ChessClock
                                        initialTime={timeLeft[isWhite ? "white" : "black"]}
                                        active={currentTurn === (isWhite ? "white" : "black") && gameData?.status !== "ended" && gameData?.status !== "waiting"}
                                        onTimeExpired={() => handleTimeExpired(isWhite ? "white" : "black")}
                                    />
                                </div>
                            </div>
                        </div>
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
                        {gameData?.status !== "ended" && (moveHistory.length <= 1 || moveHistory.length > 1) && (
                            <div className="flex gap-3 justify-center items-center py-2">
                                {moveHistory.length <= 1 && (
                                    <button
                                        onClick={handleAbort}
                                        className="relative px-6 py-2.5 bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 hover:text-orange-200 font-semibold rounded-lg border border-orange-600/30 hover:border-orange-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <span className="relative flex items-center gap-2">
                                            ⛔ Megszakítás
                                        </span>
                                    </button>
                                )}

                                {moveHistory.length > 1 && (
                                    <>
                                        <button
                                            onClick={handleOfferDraw}
                                            className="relative px-6 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-emerald-200 font-semibold rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                                        >
                                            <span className="relative flex items-center gap-2">
                                                🤝 Döntetlen
                                            </span>
                                        </button>

                                        <button
                                            onClick={handleSurrender}
                                            className="relative px-6 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-red-200 font-semibold rounded-lg border border-red-600/30 hover:border-red-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                                        >
                                            <span className="relative flex items-center gap-2">
                                                🏳️ Feladás
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
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

                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }
                    @keyframes gradient {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                    .delay-1000 {
                        animation-delay: 1s;
                    }
                    .delay-2000 {
                        animation-delay: 2s;
                    }
                    .delay-3000 {
                        animation-delay: 3s;
                    }
                    .animate-gradient {
                        background-size: 200% 200%;
                        animation: gradient 3s ease infinite;
                    }
                `}</style>
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
            {showDrawOfferModal && drawOfferedBy && (
                <DrawOfferModal
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
            )}
        </>
    );
}