import React, { useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard"; // vagy a megfelelő csomagból
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard"; // ha TS-t használsz
type Square =
    | "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8"
    | "b1" | "b2" | "b3" | "b4" | "b5" | "b6" | "b7" | "b8"
    | "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7" | "c8"
    | "d1" | "d2" | "d3" | "d4" | "d5" | "d6" | "d7" | "d8"
    | "e1" | "e2" | "e3" | "e4" | "e5" | "e6" | "e7" | "e8"
    | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8"
    | "g1" | "g2" | "g3" | "g4" | "g5" | "g6" | "g7" | "g8"
    | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "h7" | "h8";
const ChessGame: React.FC = () => {
    // játék állapota
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [moveFrom, setMoveFrom] = useState("");
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    function makeRandomMove() {
        const possibleMoves = chessGame.moves();
        if (chessGame.isGameOver()) return;

        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        chessGame.move(randomMove);
        setChessPosition(chessGame.fen());
    }

    function getMoveOptions(square: Square) {
        const moves = chessGame.moves({ square, verbose: true });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};
        for (const move of moves) {
            newSquares[move.to] = {
                background:
                    chessGame.get(move.to) && chessGame.get(move.to)?.color !== chessGame.get(square)?.color
                        ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
        }

        newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
        setOptionSquares(newSquares);
        return true;
    }

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
        if (!moveFrom && piece) {
            const hasMoveOptions = getMoveOptions(square as Square);
            if (hasMoveOptions) setMoveFrom(square);
            return;
        }

        const moves = chessGame.moves({ square: moveFrom as Square, verbose: true });
        const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

        if (!foundMove) {
            const hasMoveOptions = getMoveOptions(square as Square);
            setMoveFrom(hasMoveOptions ? square : "");
            return;
        }

        try {
            chessGame.move({ from: moveFrom as Square, to: square as Square, promotion: "q" });
        } catch {
            const hasMoveOptions = getMoveOptions(square as Square);
            setMoveFrom(hasMoveOptions ? square : "");
            return;
        }

        setChessPosition(chessGame.fen());
        setTimeout(makeRandomMove, 300);

        setMoveFrom("");
        setOptionSquares({});
    }
    // handle piece drop
    function onPieceDrop({
        sourceSquare,
        targetSquare
    }: PieceDropHandlerArgs) {
        // type narrow targetSquare potentially being null (e.g. if dropped off board)
        if (!targetSquare) {
            return false;
        }

        // try to make the move according to chess.js logic
        try {
            chessGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' // always promote to a queen for example simplicity
            });

            // update the position state upon successful move to trigger a re-render of the chessboard
            setChessPosition(chessGame.fen());

            // make random cpu move after a short delay
            setTimeout(makeRandomMove, 500);

            // return true as the move was successful
            return true;
        } catch {
            // return false as the move was not successful
            return false;
        }
    }

    return (
        <div style={{ width: 500, height: 500 }}>
            <Chessboard
                options={{
                    position: chessPosition,
                    onSquareClick,
                    onPieceDrop,
                    squareStyles: optionSquares,
                }}
            />
        </div>
    );
};

export default ChessGame;
