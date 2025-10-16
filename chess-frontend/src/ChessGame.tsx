import React, { useEffect, useRef, useState } from "react";
import { Chess, Move } from "chess.js";
import { useParams, useLocation } from "react-router-dom";
import { ref, set, onValue, get, update } from "firebase/database";
import { db, auth, firestore } from "./firebase/config";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import ChessGameView from "./ChessGameView";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import type { Square, winReason, Game, MoveHistoryType } from "./types";
import GameEndModal from "./components/GameEndModal";
import ConfirmSurrenderModal from "./components/ConfirmSurrenderModal";
import DrawOfferModal from "./components/DrawOfferModal";
import type { GameSettings } from "./components/CreateGameModal";

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
            const currentPlayers = game.players ?? { white: null, black: null };
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

            const alreadyJoined =
                currentPlayers.white?.uid === currentUser.uid ||
                currentPlayers.black?.uid === currentUser.uid;
            if (!alreadyJoined) {
                let sideToJoin: "white" | "black";
                if (!currentPlayers.white && !currentPlayers.black) {
                    sideToJoin = Math.random() < 0.5 ? "white" : "black";
                } else if (!currentPlayers.white) {
                    sideToJoin = "white";
                } else if (!currentPlayers.black) {
                    sideToJoin = "black";
                } else {
                    return;
                }

                // Lekérjük a játékos aktuális adatait a Firestore-ból
                const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
                const userData = userDoc.exists() ? userDoc.data() : { elo: 1200, wins: 0, losses: 0 };
                
                const newPlayer = {
                    uid: currentUser.uid, 
                    name: currentUser.displayName || currentUser.email, 
                    elo: userData.elo || 1200, 
                    wins: userData.wins || 0, 
                    losses: userData.losses || 0,
                    draws: userData.draws || 0
                };
                set(ref(db, `games/${gameId}/players/${sideToJoin}`), newPlayer);
            }
        });

        return () => unsubscribe();
    }, [gameId, currentUser]);
    
    // Kezdő ELO mentése amikor mindkét játékos csatlakozott
    useEffect(() => {
        if (!gameId || !gameData || gameData.startingElo) return;

        const bothPlayersJoined = gameData.players?.white && gameData.players?.black;
        if (!bothPlayersJoined) return;

        async function saveStartingElo() {
            if (!gameData?.players?.white || !gameData?.players?.black) return;

            try {
                // Lekérjük a játékosok aktuális ELO értékét Firestore-ból
                const whiteDoc = await getDoc(doc(firestore, "users", gameData.players.white.uid));
                const blackDoc = await getDoc(doc(firestore, "users", gameData.players.black.uid));

                const whiteElo = whiteDoc.exists() ? (whiteDoc.data().elo || 1200) : 1200;
                const blackElo = blackDoc.exists() ? (blackDoc.data().elo || 1200) : 1200;

                // Mentjük a kezdő ELO-t a Realtime Database-be
                const gameRef = ref(db, `games/${gameId}`);
                await update(gameRef, {
                    startingElo: { white: whiteElo, black: blackElo }
                });

                console.log("Starting ELO saved to Realtime DB:", { white: whiteElo, black: blackElo });
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
        const mySide = gameData.players.white?.uid === currentUser.uid ? "w" : gameData.players.black?.uid === currentUser.uid ? "b" : null;
        if (!mySide) return false;
        return piece.color === mySide;
    }

    function createNewGame(gameId: string, settings?: GameSettings) {
        // Ha van settings a modal-ból, használjuk, különben alapértelmezett értékek
        const timeControl = settings?.timeControl || 5; // perc
        const increment = settings?.increment || 0; // másodperc
        const opponentType = settings?.opponentType || "human";
        
        const initialTime = timeControl * 60 * 1000; // Konvertálás milliszekundumra
        const initialGame = {
            moves: [],
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            lastMove: null,
            players: { white: null, black: null },
            turn: "white",
            status: "waiting", // Waiting amíg nem lép valaki
            started: false, // A játék csak az első lépés után indul el
            timeLeft: { white: initialTime, black: initialTime },
            timeControl: timeControl, // Percben - mentjük az adatbázisba
            increment: increment, // Másodpercben - mentjük az adatbázisba
            opponentType: opponentType, // "human" vagy "ai" - mentjük az adatbázisba
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const gameRef = ref(db, `games/${gameId}`);
        set(gameRef, initialGame)
            .then(() => {
                console.log("New game created:", gameId, "with settings:", { 
                    timeControl, 
                    increment,
                    opponentType 
                });
            })
            .catch((err) => console.error("Error creating game:", err));
    }

    async function updateGameInDb(fen: string, move: Move) {
        if (!gameId || !gameData) return;
        const gameRef = ref(db, `games/${gameId}`);
        const now = Date.now();
        const lastUpdate = gameData.updatedAt || now;
        
        // Ha a játék még nem indult el (első lépés), ne számoljuk az eltelt időt
        const elapsed = gameData.started ? (now - lastUpdate) : 0;
        
        let winReason: winReason | null = null;
        // A turn UTÁN az aktuális játékos (aki most lépett) már váltott, 
        // ezért a prevTurn az aki MOST lépett, ELŐTTE volt a körén
        const currentTurnAfterMove = chessGame.turn() === "w" ? "white" : "black";
        const playerWhoJustMoved = currentTurnAfterMove === "white" ? "black" : "white";
        const newTimeLeft = { ...gameData.timeLeft };
        
        // Időkezelés: csökkentjük az eltelt időt ANNAK aki most lépett és hozzáadjuk az incrementet
        if (newTimeLeft && newTimeLeft[playerWhoJustMoved] !== undefined && gameData.started) {
            newTimeLeft[playerWhoJustMoved] = Math.max(0, newTimeLeft[playerWhoJustMoved] - elapsed);
            // Hozzáadjuk az incrementet az adatbázisból (másodpercben tárolt, milliszekundumra konvertáljuk)
            const incrementMs = (gameData.increment || 0) * 1000;
            newTimeLeft[playerWhoJustMoved] += incrementMs;
        }

        let status = "ongoing"; // Első lépés után mindig "ongoing"
        let winner: "white" | "black" | "draw" | null = null;

        if (newTimeLeft[playerWhoJustMoved] === 0 && gameData.started) {
            status = "ended";
            winner = playerWhoJustMoved === "white" ? "black" : "white";
            winReason = "timeout";
        }

        if (chessGame.isCheckmate()) {
            status = "ended";
            winner = chessGame.turn() === "w" ? "black" : "white";
            winReason = "checkmate";
        } else if (getDrawReason(chessGame)) {
            status = "ended";
            winner = "draw";
            winReason = getDrawReason(chessGame);
        }

        const currentMoves = gameData?.moves || [];
        const moveNumber = Math.floor(currentMoves.length / 2) + 1;

        const newMove: MoveHistoryType = {
            from: move.from,
            to: move.to,
            san: move.san,
            fen,
            updatedAt: Date.now(),
            moveNumber,
            timeLeft: newTimeLeft,
        };

        try {
            await update(gameRef, {
                fen,
                lastMove: { from: move.from, to: move.to, san: move.san },
                updatedAt: Date.now(),
                started: true, // Az első lépés után beállítjuk true-ra
                status,
                winner,
                moves: [...currentMoves, newMove],
                timeLeft: newTimeLeft,
                winReason,
            });
            setTimeLeft(newTimeLeft);

            // Ha véget ért a játék, frissítjük a Firestore-t
            if (status === "ended" && winner) {
                const changes = await updateFirestoreOnGameEnd(winner);
                if (changes) {
                    setEloChanges(changes);
                }
            }
        } catch (err) {
            console.error("updateGameInDb error:", err);
        }
    }
    function getDrawReason(chessGame: Chess): "stalemate" | "threefoldRepetition" | "insufficientMaterial" | "draw" | null {
        if (chessGame.isStalemate()) return "stalemate";
        if (chessGame.isThreefoldRepetition()) return "threefoldRepetition";
        if (chessGame.isInsufficientMaterial()) return "insufficientMaterial";
        if (chessGame.isDraw()) return "draw"; // általános draw, pl. 50 lépés szabály
        return null;
    }

    // ELO kalkuláció
    function calculateEloChange(winnerElo: number, loserElo: number, isDraw: boolean = false): { winnerChange: number; loserChange: number } {
        const K = 32; // K-faktor (magasabb = nagyobb változás)
        const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
        const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

        if (isDraw) {
            const winnerChange = Math.round(K * (0.5 - expectedWinner));
            const loserChange = Math.round(K * (0.5 - expectedLoser));
            return { winnerChange, loserChange };
        }

        const winnerChange = Math.round(K * (1 - expectedWinner));
        const loserChange = Math.round(K * (0 - expectedLoser));
        return { winnerChange, loserChange };
    }

    // Firestore frissítés játék végén
    async function updateFirestoreOnGameEnd(winner: "white" | "black" | "draw" | null): Promise<{ whiteChange: number; blackChange: number } | null> {
        if (!winner || !gameData?.players?.white?.uid || !gameData?.players?.black?.uid) return null;

        try {
            const whitePlayerRef = doc(firestore, "users", gameData.players.white.uid);
            const blackPlayerRef = doc(firestore, "users", gameData.players.black.uid);

            // Lekérjük a játékosok aktuális adatait
            const whiteDoc = await getDoc(whitePlayerRef);
            const blackDoc = await getDoc(blackPlayerRef);

            const whiteData = whiteDoc.exists() ? whiteDoc.data() : { elo: 1200, wins: 0, losses: 0, draws: 0 };
            const blackData = blackDoc.exists() ? blackDoc.data() : { elo: 1200, wins: 0, losses: 0, draws: 0 };

            if (winner === "draw") {
                // Döntetlen eset
                const { winnerChange: whiteChange, loserChange: blackChange } = calculateEloChange(
                    whiteData.elo || 1200,
                    blackData.elo || 1200,
                    true
                );

                // Frissítjük mindkét játékost
                await updateDoc(whitePlayerRef, {
                    elo: increment(whiteChange),
                    draws: increment(1),
                });

                await updateDoc(blackPlayerRef, {
                    elo: increment(blackChange),
                    draws: increment(1),
                });

                console.log(`Draw: White ELO ${whiteChange >= 0 ? '+' : ''}${whiteChange}, Black ELO ${blackChange >= 0 ? '+' : ''}${blackChange}`);
                
                // Mentjük a végső ELO-t a Realtime Database-be
                const finalElo = {
                    white: whiteData.elo + whiteChange,
                    black: blackData.elo + blackChange
                };
                const gameRef = ref(db, `games/${gameId}`);
                await update(gameRef, { finalElo });
                
                return { whiteChange, blackChange };
            } else {
                // Valaki nyert
                const winnerData = winner === "white" ? whiteData : blackData;
                const loserData = winner === "white" ? blackData : whiteData;
                const winnerRef = winner === "white" ? whitePlayerRef : blackPlayerRef;
                const loserRef = winner === "white" ? blackPlayerRef : whitePlayerRef;

                const { winnerChange, loserChange } = calculateEloChange(
                    winnerData.elo || 1200,
                    loserData.elo || 1200
                );

                // Frissítjük a nyertest
                await updateDoc(winnerRef, {
                    elo: increment(winnerChange),
                    wins: increment(1),
                });

                // Frissítjük a vesztest
                await updateDoc(loserRef, {
                    elo: increment(loserChange),
                    losses: increment(1),
                });

                console.log(`${winner} wins: Winner ELO +${winnerChange}, Loser ELO ${loserChange}`);
                
                // Mentjük a végső ELO-t a Realtime Database-be
                const finalElo = {
                    white: winner === "white" ? (whiteData.elo + winnerChange) : (whiteData.elo + loserChange),
                    black: winner === "black" ? (blackData.elo + winnerChange) : (blackData.elo + loserChange)
                };
                const gameRef = ref(db, `games/${gameId}`);
                await update(gameRef, { finalElo });
                
                return {
                    whiteChange: winner === "white" ? winnerChange : loserChange,
                    blackChange: winner === "black" ? winnerChange : loserChange
                };
            }
        } catch (error) {
            console.error("Error updating Firestore on game end:", error);
            return null;
        }
    }

    function getRemainingTime(side: "white" | "black") {
        if (!gameData || !gameData.timeLeft || !gameData.updatedAt) return 0;
        
        // Ha a játék még nem indult el, visszaadjuk az eredeti időt
        if (!gameData.started) return gameData.timeLeft[side];

        const now = Date.now();
        const elapsed = now - gameData.updatedAt;

        // Csak a soron következő játékos óráját csökkentjük
        const currentTurnSide = chessGame.turn() === "w" ? "white" : "black";

        if (side === currentTurnSide) {
            return Math.max(0, gameData.timeLeft[side] - elapsed);
        } else {
            return gameData.timeLeft[side];
        }
    }

    function canMove() {
        if (!currentUser || !gameData?.players) return false;

        // Ellenőrizd, hogy mindkét játékos csatlakozott-e
        if (!gameData.players.white || !gameData.players.black) return false;

        const mySide = gameData.players.white?.uid === currentUser.uid ? "white" :
            gameData.players.black?.uid === currentUser.uid ? "black" : null;

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
        
        const mySide = gameData.players.white?.uid === currentUser.uid ? "white" :
            gameData.players.black?.uid === currentUser.uid ? "black" : null;
        
        // Csak játékos adhatja fel a játékot (nem néző)
        if (!mySide) return;
        
        // Megerősítő modal megnyitása
        setShowSurrenderConfirm(true);
    }
    
    async function confirmSurrender() {
        if (!gameId || !gameData) return;
        
        // Modal bezárása azonnal
        setShowSurrenderConfirm(false);
        
        console.log("Megadás...");
        
        const gameRef = ref(db, `games/${gameId}`);
        const mySide = gameData.players?.white?.uid === currentUser?.uid ? "white" : "black";
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