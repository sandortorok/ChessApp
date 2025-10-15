import React, { useEffect, useRef, useState } from "react";
import { Chess, Move } from "chess.js";
import { useParams } from "react-router-dom";
import { ref, set, onValue, get, update } from "firebase/database";
import { db, auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import ChessGameView from "./ChessGameView";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";

type Square = | "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8" | "b1" | "b2" | "b3" | "b4" | "b5" | "b6" | "b7" | "b8" | "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7" | "c8" | "d1" | "d2" | "d3" | "d4" | "d5" | "d6" | "d7" | "d8" | "e1" | "e2" | "e3" | "e4" | "e5" | "e6" | "e7" | "e8" | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "g1" | "g2" | "g3" | "g4" | "g5" | "g6" | "g7" | "g8" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "h7" | "h8";

export interface MoveHistory {
    from: string;
    to: string;
    san: string;
    fen: string;
    updatedAt: number;
    moveNumber?: number;
}

export default function ChessGame() {
    const { gameId } = useParams<{ gameId: string }>();
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [moveFrom, setMoveFrom] = useState<"" | Square>("");
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Square; to: Square } | null>(null);
    const [gameData, setGameData] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [players, setPlayers] = useState<{ white: any; black: any } | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
    const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(null);
    
    const currentTurn = chessGame.turn() === "w" ? "white" : "black";
    
    // Auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!gameId || !currentUser) return;

        const gameRef = ref(db, `games/${gameId}`);

        get(gameRef)
            .then((snap) => {
                if (!snap.exists()) {
                    console.log("No game found, creating new one.");
                    createNewGame(gameId);
                }
            })
            .catch((err) => console.error("Error checking game:", err));

        const unsubscribe = onValue(gameRef, (snap) => {
            const game = snap.val();
            if (!game) return;

            const currentPlayers = game.players ?? { white: null, black: null };
            setPlayers(currentPlayers);
            setGameData(game);

            // Lépéstörténet betöltése
            if (game.moves && Array.isArray(game.moves)) {
                setMoveHistory(game.moves);
            }

            // Ha nem nézünk vissza a történetben, frissítjük a pozíciót
            if (viewingHistoryIndex === null) {
                if (game.fen && game.fen !== chessPosition) {
                    chessGame.load(game.fen);
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

                const newPlayer = { uid: currentUser.uid, name: currentUser.displayName || currentUser.email };
                set(ref(db, `games/${gameId}/players/${sideToJoin}`), newPlayer);
            }
        });

        return () => unsubscribe();
    }, [gameId, currentUser, viewingHistoryIndex]);

    function isMyPiece(square: Square) {
        const piece = chessGame.get(square);
        if (!piece) return false;
        if (!currentUser || !players) return false;
        const mySide = players.white?.uid === currentUser.uid ? "w" : players.black?.uid === currentUser.uid ? "b" : null;
        if (!mySide) return false;
        return piece.color === mySide;
    }

    function createNewGame(gameId: string) {
        const initialGame = {
            moves: [],
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            lastMove: null,
            players: { white: null, black: null },
            turn: "white",
            status: "waiting",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const gameRef = ref(db, `games/${gameId}`);
        set(gameRef, initialGame)
            .then(() => {
                console.log("New game created:", gameId);
            })
            .catch((err) => console.error("Error creating game:", err));
    }

    async function updateGameInDb(fen: string, move: Move) {
        if (!gameId) return;
        const gameRef = ref(db, `games/${gameId}`);
        
        let status = "ongoing";
        let winner: "white" | "black" | "draw" | null = null;

        if (chessGame.isCheckmate()) {
            console.log("Checkmate detected");
            status = "ended";
            winner = chessGame.turn() === "w" ? "black" : "white";
        } else if (chessGame.isDraw() || chessGame.isStalemate() || chessGame.isThreefoldRepetition() || chessGame.isInsufficientMaterial()) {
            status = "ended";
            winner = "draw";
        }

        const currentMoves = gameData?.moves || [];
        const moveNumber = Math.floor(currentMoves.length / 2) + 1;
        
        const newMove: MoveHistory = {
            from: move.from,
            to: move.to,
            san: move.san,
            fen,
            updatedAt: Date.now(),
            moveNumber
        };

        try {
            await update(gameRef, {
                fen,
                lastMove: { from: move.from, to: move.to, san: move.san },
                updatedAt: Date.now(),
                status,
                winner,
                moves: [...currentMoves, newMove],
            });
        } catch (err) {
            console.error("updateGameInDb error:", err);
        }
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

    return (
        <ChessGameView
            chessPosition={chessPosition}
            optionSquares={optionSquares}
            lastMoveSquares={lastMoveSquares}
            onSquareClick={onSquareClick}
            onPieceDrop={onPieceDrop}
            players={gameData?.players}
            currentUser={currentUser}
            currentTurn={currentTurn}
            moveHistory={moveHistory}
            viewingHistoryIndex={viewingHistoryIndex}
            onViewMove={viewMove}
            onGoToLatest={goToLatestPosition}
        />
    );
}