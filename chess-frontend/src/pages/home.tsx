import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Home() {
    const user = useAuth();
    const navigate = useNavigate();

    const createNewGame = () => {
        if (!user) return alert("Please login first");
        const newGameId = Date.now().toString(); // egyszerű egyedi ID
        navigate(`/game/${newGameId}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
            <h1 className="text-8xl m-10 font-bold">Chess Lobby</h1>
            <button 
                type="button"
                className="text-teal-700 hover:text-white border border-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-teal-500 dark:text-teal-500 dark:hover:text-white dark:hover:bg-teal-600 dark:focus:ring-teal-800 cursor-pointer    "
                onClick={createNewGame}>
                Create New Game
            </button>

        </div>
    );
}

export default Home;