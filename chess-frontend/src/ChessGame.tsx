import React, { useEffect, useRef, useState } from "react";
import { Chess, Move } from "chess.js";
import { useParams, useLocation } from "react-router-dom";
import { ref, onValue, get, update } from "firebase/database";
import { db, auth } from "./firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";
import ChessGameView from "./ChessGameView";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import type { Square, winReason, Game, MoveHistoryType } from "./types";
import GameEndModal from "./components/GameEndModal";
import ConfirmSurrenderModal from "./components/ConfirmSurrenderModal";
import DrawOfferModal from "./components/DrawOfferModal";
import type { GameSettings } from "./components/CreateGameModal";
import { gameService } from "./services/gameService";
import { playerService } from "./services/playerService";

export default function ChessGame() {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const gameSettings = (location.state as { gameSettings?: GameSettings })?.gameSettings;
    
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
    const [winReason, setWinReason] = useState<winReason>("checkmate");
    const [eloChanges, setEloChanges] = useState<{ whiteChange: number; blackChange: number } | null>(null);
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
    const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);

    // Auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);
    // Game listener
    useEffect(() => {
        if (!gameId || !currentUser) return;

        const gameRef = ref(db, `games/${gameId}`);

        get(gameRef)
            .then((snap) => {
                if (!snap.exists()) {
                    console.log("No game found, creating new one.");
                    createNewGame(gameId, gameSettings);
                }
            })
            .catch((err) => console.error("Error checking game:", err));

        const unsubscribe = onValue(gameRef, async (snap) => {
            const game = snap.val();
            if (!game) return;
            
            // FONTOS: Először frissítsük a FEN-t, hogy a chessGame.turn() helyes legyen
            if (game.fen && viewingHistoryIndex === null) {
                chessGame.load(game.fen);
            }
            
            // Csak akkor számoljuk az időt, ha a játék folyamatban van (started === true ÉS status !== "ended")
            if (game.timeLeft && game.updatedAt && game.started && game.status !== "ended") {
                const now = Date.now();
                const elapsed = now - game.updatedAt; // mennyi idő telt el az utolsó lépés óta

                // az éppen soron következő játékos (most már helyes a turn, mert betöltöttük a FEN-t)
                const currentTurn = chessGame.turn() === "w" ? "white" : "black";
                console.log(currentTurn)
                // frissített idő csak a soron következő játékosnak
                const newTimeLeft = {
                    white: game.timeLeft.white,
                    black: game.timeLeft.black,
                    [currentTurn]: Math.max(0, game.timeLeft[currentTurn] - elapsed),
                };
                console.log(currentTurn);
                setTimeLeft(newTimeLeft);
                console.log("Updated time left:", newTimeLeft);
            } else if (game.timeLeft) {
                // Ha a játék még nem indult el VAGY véget ért, csak betöltjük az utolsó mentett időt
                setTimeLeft(game.timeLeft);
            }
            setGameData(game);

            // Lépéstörténet betöltése
            if (game.moves && Array.isArray(game.moves)) {
                setMoveHistory(game.moves);
            }

            // Ha nem nézünk vissza a történetben, frissítjük a pozíciót
            if (viewingHistoryIndex === null) {
                // FEN már be lett töltve fentebb, csak a pozíciót és a kiemelt négyzeteket frissítjük
                if (game.fen && game.fen !== chessPosition) {
                    setChessPosition(game.fen);
                }

                if (game.lastMove) {
                    setLastMoveSquares({ from: game.lastMove.from, to: game.lastMove.to });
                }
            }

            // Játékoshoz csatlakozás - Service-t használjuk
            await playerService.joinGame(gameId, currentUser, game);
        });

        return () => unsubscribe();
    }, [gameId, currentUser]);
    
    // Kezdő ELO mentése amikor mindkét játékos csatlakozott
    useEffect(() => {
        if (!gameId || !gameData || gameData.startingElo) return;

        const bothPlayersJoined = gameData.players?.white && gameData.players?.black;
        if (!bothPlayersJoined) return;

        async function saveStartingElo() {
            if (!gameId || !gameData?.players?.white || !gameData?.players?.black) return;

            try {
                // Service-t használjuk a kezdő ELO mentésére
                await gameService.saveStartingElo(
                    gameId, 
                    gameData.players.white.uid, 
                    gameData.players.black.uid
                );
            } catch (error) {
                console.error("Error saving starting ELO:", error);
            }
        }

        saveStartingElo();
    }, [gameId, gameData?.players, gameData?.startingElo]);
    
    // Játék vége modal megjelenítése
    useEffect(() => {
        if (!gameData) return;

        // Játék vége modal megjelenítése mindenkinek (játékosoknak és nézőknek is)
        if (gameData.status === "ended" && !showEndModal && prevStatus !== "ended") {
            setWinReason(gameData.winReason || "checkmate");
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

    function createNewGame(gameId: string, settings?: GameSettings) {
        // Service-t használjuk az új játék létrehozásához
        gameService.createNewGame(gameId, settings);
    }

    async function updateGameInDb(fen: string, move: Move) {
        if (!gameId || !gameData) return;
        
        // Service-t használjuk a játék frissítéséhez
        const eloChanges = await gameService.updateGameInDb(gameId, gameData, chessGame, fen, move);
        
        // Frissítjük az időt manuálisan, mert a service az adatbázisba menti
        // De az adatbázis listener majd frissíti a state-et
        
        // Ha van ELO változás (játék véget ért)
        if (eloChanges) {
            setEloChanges(eloChanges);
        }
    }
    
    // Firestore frissítés játék végén - Service-t használjuk
    async function updateFirestoreOnGameEnd(winner: "white" | "black" | "draw" | null): Promise<{ whiteChange: number; blackChange: number } | null> {
        if (!gameId || !gameData) return null;
        return await gameService.updateFirestoreOnGameEnd(gameId, gameData, winner);
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
            updateGameInDb(newFen, move);
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
            const move = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
            if (!move) return false;
            const newFen = chessGame.fen();
            setChessPosition(newFen);
            setLastMoveSquares({ from: sourceSquare as Square, to: targetSquare as Square });
            updateGameInDb(newFen, move);
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
            const changes = await updateFirestoreOnGameEnd("draw");
            if (changes) {
                setEloChanges(changes);
            }
            
            setWinReason("aggreement");
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
            setWinReason("aborted");
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
            const changes = await updateFirestoreOnGameEnd(winner);
            if (changes) {
                setEloChanges(changes);
            }
            
            setWinReason("resignation");
            setShowEndModal(true);
        } catch (err) {
            console.error("Error updating game on surrender:", err);
        }
    }
    // Callback amikor lejár valamelyik játékos ideje
    async function handleTimeExpired(side: "white" | "black") {
        if (!gameId || gameData?.status === "ended") return;

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
            const changes = await updateFirestoreOnGameEnd(winner);
            if (changes) {
                setEloChanges(changes);
            }
            
            setWinReason("timeout");
            setShowEndModal(true);
        } catch (err) {
            console.error("Error updating game on timeout:", err);
        }
    }

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