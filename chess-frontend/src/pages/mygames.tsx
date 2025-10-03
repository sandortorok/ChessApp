import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function MyGames() {
    const [games, setGames] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => setCurrentUser(user));
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const gamesRef = ref(db, "games");
        const unsub = onValue(gamesRef, (snap) => {
            const val = snap.val() || {};
            const list = Object.entries(val)
                .map(([id, g]: any) => ({ id, ...g }))
                .filter(
                    (g) =>
                        g.players?.white?.uid === currentUser.uid ||
                        g.players?.black?.uid === currentUser.uid
                ); // csak a saját meccsek
            setGames(list);
            console.log("Fetched games for user:", currentUser.uid, list);
        });

        return () => unsub();
    }, [currentUser]);

    function openGame(gameId: string) {
        navigate(`/game/${gameId}`);
    }

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">♟️ My Games</h1>

            {games.length === 0 ? (
                <p className="text-center text-gray-500">You have no active games</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {games.map((game) => (
                        <li
                            key={game.id}
                            className="p-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer "
                            onClick={() => openGame(game.id)}
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
            )}
        </div>
    );
}
