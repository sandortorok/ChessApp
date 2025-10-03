// ChessGameView.tsx
import React from "react";
import { Chessboard } from "react-chessboard";
import PlayerInfo from "./PlayerInfo";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import ChessClock from "./components/ChessClock";

interface Props {
    chessPosition: string;
    optionSquares: Record<string, React.CSSProperties>;
    lastMoveSquares: { from: string; to: string } | null;
    onSquareClick: (args: SquareHandlerArgs) => void;
    onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
    players?: { white?: any; black?: any } | null;
    currentUser?: any | null;
    currentTurn?: "white" | "black";
}

export default function ChessGameView({
    chessPosition,
    optionSquares,
    lastMoveSquares,
    onSquareClick,
    onPieceDrop,
    players,
    currentUser,
    currentTurn,
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

            <div className="w-full max-w-[500px] flex justify-between items-center mb-2">
                <PlayerInfo
                    color={isWhite ? "black" : "white"}
                    player={topPlayer}
                />
                <div className="ml-2 flex-shrink-0 transform scale-90 sm:scale-100">
                    <ChessClock initialTime={300} active={currentTurn === (isWhite ? "black" : "white")} />
                </div>
            </div>


            <div className="w-full max-w-[500px] aspect-square">
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
            <div className="w-full max-w-[500px] flex justify-between items-center mb-2">
                <PlayerInfo color={isWhite ? "white" : "black"} player={bottomPlayer} />
                <div className="mt-2 sm:mt-0 transform scale-90 sm:scale-100">
                    <ChessClock initialTime={300} active={currentTurn === (isWhite ? "white" : "black")} />
                </div>
            </div>
        </div>
    );
}
