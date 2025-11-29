import React from "react";
import { Chessboard } from "react-chessboard";
import type { SquareHandlerArgs, PieceDropHandlerArgs } from "react-chessboard";
import GameStatusOverlay from "./GameStatusOverlay";
import type { Game } from "../types";

interface ChessboardWrapperProps {
    position: string;
    onSquareClick: (args: SquareHandlerArgs) => void;
    onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
    squareStyles: Record<string, React.CSSProperties>;
    boardOrientation: "white" | "black";
    viewingHistoryIndex: number | null;
    gameData: Game | null;
}

export default function ChessboardWrapper({
    position,
    onSquareClick,
    onPieceDrop,
    squareStyles,
    boardOrientation,
    viewingHistoryIndex,
    gameData,
}: ChessboardWrapperProps) {
    return (
        <div className="flex-1 w-full max-w-[470px] mx-auto relative group flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl transition-all duration-300" />
            <div className="relative rounded-xl overflow-hidden border-2 border-teal-500/30 shadow-2xl">
                <Chessboard
                    options={{
                        position,
                        onSquareClick,
                        onPieceDrop,
                        squareStyles,
                        darkSquareStyle: { backgroundColor: "#08947aff" },
                        boardOrientation,
                        lightSquareStyle: { backgroundColor: "#d1fae5" },
                    }}
                />
            </div>
            {viewingHistoryIndex !== null && <GameStatusOverlay variant="viewingHistory" />}
            {gameData?.status === "waiting" && gameData.players?.white && gameData.players?.black && (
                <GameStatusOverlay variant="waiting" subtitle="Waiting for first move..." />
            )}
            {gameData?.status === "waiting" && (!gameData.players?.white || !gameData.players?.black) && (
                <GameStatusOverlay
                    variant="waitingForPlayers"
                    subtitle={
                        !gameData.players?.white && !gameData.players?.black
                            ? "Waiting for both players..."
                            : gameData.players?.white && !gameData.players?.black
                            ? "Waiting for Black player..."
                            : "Waiting for White player..."
                    }
                />
            )}
        </div>
    );
}
