import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
    const [games, setGames] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const gamesRef = ref(db, "games");
        const unsub = onValue(gamesRef, (snap) => {
            const val = snap.val() || {};
            const list = Object.entries(val).map(([id, g]: any) => ({
                id,
                ...g,
            }));
            setGames(list);
            console.log("Fetched games:", list);
        });
        return () => unsub();
    }, []);

    async function createGame() {
        const newGameId = Date.now().toString(); // egyszerű egyedi ID
        navigate(`/game/${newGameId}`);
    }

    function joinGame(gameId: string) {
        navigate(`/game/${gameId}`);
    }

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">🎮 Chess Lobby</h1>

            <button
                onClick={createGame}
                className="mb-6 w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 cursor-pointer text-center flex items-center justify-center gap-2"
            >
                + Create New Game
            </button>

            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {games.length === 0 && (
                    <p className="text-center text-gray-500">No active games yet</p>
                )}

                {games.map((game) => (
                    <li
                        key={game.id}
                        className="py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => joinGame(game.id)}
                    >
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <div className="shrink-0">
                                <img
                                    className="w-8 h-8 rounded-full"
                                    src="/LobbyIcon2.png"
                                    alt="chess"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                    Game {game.id}
                                </p>
                                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                    {game.players?.white
                                        ? game.players.white.name || (game.players.white.uid ? "Guest" : "Waiting")
                                        : "Waiting"}{" "}
                                    vs{" "}
                                    {game.players?.black
                                        ? game.players.black.name || (game.players.black.uid ? "Guest" : "Waiting")
                                        : "Waiting"}
                                </p>
                            </div>
                            <div className="inline-flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                                {game.status === "waiting" ? (
                                    <span className="text-yellow-600">⏳ Waiting</span>
                                ) : game.status === "ongoing" ? (
                                    <span className="text-green-600">▶ Ongoing</span>
                                ) : (
                                    <span className="text-red-500">✔ Ended</span>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
