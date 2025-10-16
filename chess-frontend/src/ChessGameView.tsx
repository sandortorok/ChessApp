import React from "react";
import { Chessboard } from "react-chessboard";
import PlayerInfo from "./PlayerInfo";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import ChessClock from "./components/ChessClock";
import type { MoveHistoryType, Player } from "./types";
import MoveHistory from "./components/moveHistory";
import ChatBox from "./components/ChatBox";

interface Props {
    chessPosition: string;
    optionSquares: Record<string, React.CSSProperties>;
    lastMoveSquares: { from: string; to: string } | null;
    moveHistory?: MoveHistoryType[];
    viewingHistoryIndex: number | null;
    players: { white?: Player | null; black?: Player | null } | null;
    currentUser: { uid?: string; displayName?: string | null; email?: string | null } | null;
    currentTurn: "white" | "black";
    timeLeft: { white: number; black: number };
    gameStatus?: string;
    startingElo?: { white: number; black: number };
    finalElo?: { white: number; black: number };
    eloChanges?: { whiteChange: number; blackChange: number } | null;
    gameId?: string; // Chat-hez szükséges
    onSquareClick: (args: SquareHandlerArgs) => void;
    onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
    onViewMove: (index: number) => void;
    onGoToLatest: () => void;
    onSurrender: () => void;
    onOfferDraw?: () => void;
    onAbort?: () => void;
    onTimeExpired?: (side: "white" | "black") => void; // Callback amikor lejár valamelyik idő
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
    timeLeft,
    gameStatus,
    startingElo,
    finalElo,
    eloChanges,
    onSurrender,
    onOfferDraw,
    onAbort,
    onTimeExpired,
    gameId
}: Props) {
    const isWhite = currentUser?.uid === players?.white?.uid;
    const boardOrientation = isWhite ? "white" : "black";

    const topPlayer = isWhite ? players?.black : players?.white;
    const bottomPlayer = isWhite ? players?.white : players?.black;

    // ELO adatok kiszámítása
    const topPlayerColor = isWhite ? "black" : "white";
    const bottomPlayerColor = isWhite ? "white" : "black";
    
    const topPlayerStartingElo = startingElo?.[topPlayerColor];
    const bottomPlayerStartingElo = startingElo?.[bottomPlayerColor];
    
    // Ha van finalElo (játék véget ért), azt mutatjuk, különben a startingElo-t vagy player eredeti ELO-ját
    const topPlayerCurrentElo = finalElo?.[topPlayerColor] || startingElo?.[topPlayerColor] || topPlayer?.elo;
    const bottomPlayerCurrentElo = finalElo?.[bottomPlayerColor] || startingElo?.[bottomPlayerColor] || bottomPlayer?.elo;
    
    // ELO változás kiszámítása ha van startingElo és finalElo
    const topPlayerEloChange = (finalElo?.[topPlayerColor] && startingElo?.[topPlayerColor]) 
        ? finalElo[topPlayerColor] - startingElo[topPlayerColor]
        : (topPlayerColor === "white" ? eloChanges?.whiteChange : eloChanges?.blackChange);
    const bottomPlayerEloChange = (finalElo?.[bottomPlayerColor] && startingElo?.[bottomPlayerColor])
        ? finalElo[bottomPlayerColor] - startingElo[bottomPlayerColor]
        : (bottomPlayerColor === "white" ? eloChanges?.whiteChange : eloChanges?.blackChange);

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
                {/* Bal oszlop: PlayerInfo - Chessboard - PlayerInfo (66%) */}
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
                                    active={currentTurn === (isWhite ? "black" : "white") && gameStatus !== "ended" && gameStatus !== "waiting"}
                                    onTimeExpired={() => onTimeExpired?.(isWhite ? "black" : "white")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sakktábla - flex-1 hogy kitöltse a helyet */}
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
                        {gameStatus === "waiting" && players?.white && players?.black && (
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
                        {gameStatus === "waiting" && (!players?.white || !players?.black) && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-60" />
                                    <div className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-gray-900 px-8 py-3 rounded-2xl font-bold text-lg shadow-2xl border-4 border-white/40 animate-pulse">
                                        👥 WAITING FOR PLAYERS
                                        <div className="text-xs font-normal mt-1 opacity-80">
                                            {!players?.white && !players?.black && "Waiting for both players..."}
                                            {players?.white && !players?.black && "Waiting for Black player..."}
                                            {!players?.white && players?.black && "Waiting for White player..."}
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
                                    active={currentTurn === (isWhite ? "white" : "black") && gameStatus !== "ended" && gameStatus !== "waiting"}
                                    onTimeExpired={() => onTimeExpired?.(isWhite ? "white" : "black")}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jobb oszlop: ViewHistory - Gombok - ChatBox (33%) */}
                <div className="flex flex-col lg:flex-1 gap-3 w-full lg:w-auto">
                    {/* Lépéstörténet - flex-1 */}
                    <div className="flex-1 min-h-0">
                        <MoveHistory
                            moveHistory={moveHistory}
                            viewingHistoryIndex={viewingHistoryIndex}
                            onViewMove={onViewMove}
                            onGoToLatest={onGoToLatest}
                        />
                    </div>
                    
                    {/* Game action buttons - csak akkor jelenik meg ha van gomb */}
                    {gameStatus !== "ended" && (moveHistory.length <= 1 || moveHistory.length > 1) && (
                        <div className="flex gap-3 justify-center items-center py-2">
                            {/* Abort gomb - csak 0-1 lépés esetén */}
                            {moveHistory.length <= 1 && onAbort && (
                                <button
                                    onClick={onAbort}
                                    className="relative px-6 py-2.5 bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 hover:text-orange-200 font-semibold rounded-lg border border-orange-600/30 hover:border-orange-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <span className="relative flex items-center gap-2">
                                        ⛔ Megszakítás
                                    </span>
                                </button>
                            )}
                            
                            {/* Döntetlen gomb - csak 2+ lépés esetén */}
                            {moveHistory.length > 1 && (
                                <button
                                    onClick={onOfferDraw}
                                    className="relative px-6 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-emerald-200 font-semibold rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <span className="relative flex items-center gap-2">
                                        🤝 Döntetlen
                                    </span>
                                </button>
                            )}
                            
                            {/* Feladás gomb - csak 2+ lépés esetén */}
                            {moveHistory.length > 1 && (
                                <button
                                    onClick={onSurrender}
                                    className="relative px-6 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-red-200 font-semibold rounded-lg border border-red-600/30 hover:border-red-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <span className="relative flex items-center gap-2">
                                        🏳️ Feladás
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Chat Box - flex-1 */}
                    <div className="flex-1 min-h-0">
                        {gameId && currentUser?.uid && (
                            <ChatBox
                                gameId={gameId}
                                currentUserId={currentUser.uid}
                                currentUserName={
                                    currentUser.displayName || 
                                    currentUser.email?.split('@')[0] || 
                                    (players?.white?.uid === currentUser.uid
                                        ? (players.white.displayName || players.white.email?.split('@')[0] || "Játékos")
                                        : players?.black?.uid === currentUser.uid
                                        ? (players.black.displayName || players.black.email?.split('@')[0] || "Játékos")
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
    );
}