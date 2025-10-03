// ChessGameView.tsx
import React from "react";
import { Chessboard } from "react-chessboard";
import PlayerInfo from "./PlayerInfo";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";

interface Props {
    chessPosition: string;
    optionSquares: Record<string, React.CSSProperties>;
    lastMoveSquares: { from: string; to: string } | null;
    onSquareClick: (args: SquareHandlerArgs) => void;
    onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
    players?: { white?: any; black?: any } | null;
    currentUser?: any | null;
}

export default function ChessGameView({
    chessPosition,
    optionSquares,
    lastMoveSquares,
    onSquareClick,
    onPieceDrop,
    players,
    currentUser,
}: Props) {
    const isWhite = currentUser?.uid === players?.white?.uid;

    // A tábla nézőpontja a saját oldal
    const boardOrientation = isWhite ? "white" : "black";

    // Feliratok sorrendje: felül a másik, alul a saját
    const topPlayer = isWhite ? players?.black : players?.white;
    const bottomPlayer = isWhite ? players?.white : players?.black;

    const combinedSquareStyles = {
        ...optionSquares,
        ...(lastMoveSquares
            ? {
                [lastMoveSquares.from]: { background: "rgba(0, 221, 255, 0.4)" },
                [lastMoveSquares.to]: { background: "rgba(0, 221, 255, 0.4)" },
            }
            : {}),
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4 bg-teal-900 rounded-lg">  
            <PlayerInfo color={isWhite ? "black" : "white"} player={topPlayer} />

            <div style={{ width: 500, height: 500 }}>
                <Chessboard
                    options={{
                        position: chessPosition,
                        onSquareClick,
                        onPieceDrop,
                        squareStyles: combinedSquareStyles,
                        darkSquareStyle: { backgroundColor: "#769656" },
                        boardOrientation,
                        lightSquareStyle: { backgroundColor: "#eeeed2" },
                    }}
                />
            </div>

            <PlayerInfo color={isWhite ? "white" : "black"} player={bottomPlayer} />
        </div>
    );
}
