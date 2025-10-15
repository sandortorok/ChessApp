import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import PlayerInfo from "./PlayerInfo";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import ChessClock from "./components/ChessClock";
import type { MoveHistory } from "./ChessGame";

interface Props {
    chessPosition: string;
    optionSquares: Record<string, React.CSSProperties>;
    lastMoveSquares: { from: string; to: string } | null;
    onSquareClick: (args: SquareHandlerArgs) => void;
    onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
    moveHistory?: MoveHistory[];
    viewingHistoryIndex: number | null;
    onViewMove?: (index: number) => void;
    onGoToLatest?: () => void;
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
    moveHistory = [],
    viewingHistoryIndex,
    onViewMove,
    onGoToLatest,
}: Props) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const isWhite = currentUser?.uid === players?.white?.uid;
    const boardOrientation = isWhite ? "white" : "black";

    const topPlayer = isWhite ? players?.black : players?.white;
    const bottomPlayer = isWhite ? players?.white : players?.black;

    const combinedSquareStyles = {
        ...optionSquares,
        ...(lastMoveSquares
            ? {
                [lastMoveSquares.from]: { background: "rgba(20, 184, 166, 0.4)" },
                [lastMoveSquares.to]: { background: "rgba(20, 184, 166, 0.4)" },
            }
            : {}),
    };

    // Lépések párokba rendezése (fehér-fekete)
    const movePairs: Array<{ white?: MoveHistory; black?: MoveHistory; moveNumber: number }> = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        const white = moveHistory[i];
        const black = moveHistory[i + 1];
        movePairs.push({
            white,
            black,
            moveNumber: Math.floor(i / 2) + 1,
        });
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900">
            {/* Animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.15),transparent_50%)]" />
                
                {/* Mouse-following glow */}
                <div 
                    className="absolute w-96 h-96 rounded-full bg-teal-500/20 blur-3xl transition-all duration-300 pointer-events-none"
                    style={{
                        left: mousePosition.x - 192,
                        top: mousePosition.y - 192,
                    }}
                />
            </div>

            {/* Floating chess pieces */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-20 left-10 text-6xl animate-float">♔</div>
                <div className="absolute top-40 right-20 text-5xl animate-float delay-1000">♕</div>
                <div className="absolute bottom-32 left-1/4 text-7xl animate-float delay-2000">♖</div>
                <div className="absolute bottom-20 right-1/3 text-6xl animate-float delay-3000">♗</div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 p-4 lg:p-8 min-h-screen">
                {/* Bal oldal: Sakktábla és játékosok */}
                <div className="flex flex-col items-center space-y-4 w-full lg:w-auto">
                    {/* Felső játékos */}
                    <div className="w-full max-w-[600px] relative backdrop-blur-xl bg-gray-900/30 rounded-2xl p-4 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 pointer-events-none" />
                        <div className="relative flex justify-between items-center z-10">
                            <PlayerInfo color={isWhite ? "black" : "white"} player={topPlayer} position="top" />
                            <div className="ml-4">
                                <ChessClock 
                                    initialTime={300} 
                                    active={currentTurn === (isWhite ? "black" : "white")} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sakktábla */}
                    <div className="w-full max-w-[600px] relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <div className="relative rounded-2xl overflow-hidden border-2 border-teal-500/30 shadow-2xl">
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
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-70" />
                                    <div className="relative bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 text-gray-900 px-6 py-2 rounded-full font-bold text-sm shadow-xl border-2 border-white/30 animate-gradient">
                                        📜 Történet megtekintése
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Alsó játékos */}
                    <div className="w-full max-w-[600px] relative backdrop-blur-xl bg-gray-900/30 rounded-2xl p-4 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 pointer-events-none" />
                        <div className="relative flex justify-between items-center z-10">
                            <PlayerInfo color={isWhite ? "white" : "black"} player={bottomPlayer} position="bottom" />
                            <div className="ml-4">
                                <ChessClock 
                                    initialTime={300} 
                                    active={currentTurn === (isWhite ? "white" : "black")} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jobb oldal: Lépéstörténet */}
                <div className="w-full lg:w-96 relative backdrop-blur-xl bg-gray-900/30 rounded-2xl border border-teal-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />
                    
                    {/* Fejléc */}
                    <div className="relative bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-b border-teal-500/20 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                                <span className="text-3xl">♟</span>
                                Lépések
                            </h2>
                            {viewingHistoryIndex !== null && onGoToLatest && (
                                <button
                                    onClick={onGoToLatest}
                                    className="group relative px-4 py-2 text-sm font-semibold text-white overflow-hidden rounded-lg"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 transition-transform duration-300 group-hover:scale-105" />
                                    <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative flex items-center gap-1">
                                        🔄 Élő játék
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative p-5">
                        {moveHistory.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-7xl mb-4 opacity-20">♟</div>
                                <p className="text-gray-400 text-lg">Még nincsenek lépések</p>
                                <p className="text-gray-500 text-sm mt-2">A játék itt fog megjelenni</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                {movePairs.map((pair, pairIndex) => (
                                    <div
                                        key={pairIndex}
                                        className="flex items-center gap-3 backdrop-blur-sm bg-gray-900/20 hover:bg-gray-900/40 rounded-xl p-2 transition-all border border-teal-500/10 hover:border-teal-500/30"
                                    >
                                        <span className="text-teal-400 font-bold text-lg w-10 text-center bg-gray-900/50 rounded-lg py-1 border border-teal-500/20">
                                            {pair.moveNumber}
                                        </span>

                                        <div className="flex gap-2 flex-1">
                                            {pair.white && (
                                                <button
                                                    onClick={() => onViewMove?.(pairIndex * 2)}
                                                    className={`group relative flex-1 text-center px-4 py-3 rounded-lg font-mono font-semibold text-lg overflow-hidden transition-all transform hover:scale-105 ${
                                                        viewingHistoryIndex === pairIndex * 2
                                                            ? "border-2 border-teal-400"
                                                            : "border border-teal-500/20"
                                                    }`}
                                                >
                                                    <span className={`absolute inset-0 transition-opacity duration-300 ${
                                                        viewingHistoryIndex === pairIndex * 2
                                                            ? "bg-gradient-to-r from-teal-500 to-cyan-500 opacity-100"
                                                            : "bg-gray-900/50 group-hover:bg-gray-900/70 opacity-100"
                                                    }`} />
                                                    <span className="relative text-white">{pair.white.san}</span>
                                                </button>
                                            )}

                                            {pair.black && (
                                                <button
                                                    onClick={() => onViewMove?.(pairIndex * 2 + 1)}
                                                    className={`group relative flex-1 text-center px-4 py-3 rounded-lg font-mono font-semibold text-lg overflow-hidden transition-all transform hover:scale-105 ${
                                                        viewingHistoryIndex === pairIndex * 2 + 1
                                                            ? "border-2 border-teal-400"
                                                            : "border border-teal-500/20"
                                                    }`}
                                                >
                                                    <span className={`absolute inset-0 transition-opacity duration-300 ${
                                                        viewingHistoryIndex === pairIndex * 2 + 1
                                                            ? "bg-gradient-to-r from-teal-500 to-cyan-500 opacity-100"
                                                            : "bg-gray-900/70 group-hover:bg-gray-900/90 opacity-100"
                                                    }`} />
                                                    <span className="relative text-white">{pair.black.san}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Navigációs gombok */}
                        {moveHistory.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-teal-500/20">
                                <button
                                    onClick={() => onViewMove?.(0)}
                                    disabled={viewingHistoryIndex === 0}
                                    className="relative backdrop-blur-sm bg-gray-900/30 hover:bg-gray-900/50 disabled:bg-gray-900/20 disabled:text-gray-600 text-white px-3 py-3 rounded-lg font-bold transition-all transform hover:scale-105 disabled:transform-none border border-teal-500/20 hover:border-teal-500/40 disabled:border-teal-500/10 group overflow-hidden"
                                    title="Első lépés"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative">⏮</span>
                                </button>
                                <button
                                    onClick={() =>
                                        viewingHistoryIndex !== null && onViewMove?.(Math.max(0, viewingHistoryIndex - 1))
                                    }
                                    disabled={viewingHistoryIndex === null || viewingHistoryIndex === 0}
                                    className="relative backdrop-blur-sm bg-gray-900/30 hover:bg-gray-900/50 disabled:bg-gray-900/20 disabled:text-gray-600 text-white px-3 py-3 rounded-lg font-bold transition-all transform hover:scale-105 disabled:transform-none border border-teal-500/20 hover:border-teal-500/40 disabled:border-teal-500/10 group overflow-hidden"
                                    title="Előző lépés"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative">◀</span>
                                </button>
                                <button
                                    onClick={() =>
                                        viewingHistoryIndex !== null &&
                                        onViewMove?.(Math.min(moveHistory.length - 1, viewingHistoryIndex + 1))
                                    }
                                    disabled={viewingHistoryIndex === null || viewingHistoryIndex === moveHistory.length - 1}
                                    className="relative backdrop-blur-sm bg-gray-900/30 hover:bg-gray-900/50 disabled:bg-gray-900/20 disabled:text-gray-600 text-white px-3 py-3 rounded-lg font-bold transition-all transform hover:scale-105 disabled:transform-none border border-teal-500/20 hover:border-teal-500/40 disabled:border-teal-500/10 group overflow-hidden"
                                    title="Következő lépés"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative">▶</span>
                                </button>
                                <button
                                    onClick={() => onViewMove?.(moveHistory.length - 1)}
                                    disabled={viewingHistoryIndex === moveHistory.length - 1}
                                    className="relative backdrop-blur-sm bg-gray-900/30 hover:bg-gray-900/50 disabled:bg-gray-900/20 disabled:text-gray-600 text-white px-3 py-3 rounded-lg font-bold transition-all transform hover:scale-105 disabled:transform-none border border-teal-500/20 hover:border-teal-500/40 disabled:border-teal-500/10 group overflow-hidden"
                                    title="Utolsó lépés"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative">⏭</span>
                                </button>
                            </div>
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(20, 184, 166, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(20, 184, 166, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(20, 184, 166, 0.7);
                }
            `}</style>
        </div>
    );
}