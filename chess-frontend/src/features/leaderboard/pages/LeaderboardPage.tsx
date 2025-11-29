import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { 
    LeaderboardHeader, 
    Podium, 
    LeaderboardTable, 
    LoadingState, 
    EmptyState 
} from "../components";
import { getDisplayName } from "../utils/leaderboardHelpers";

const DEFAULT_AVATAR = "emoji:👤";

interface Player {
    uid: string;
    name?: string;
    displayName?: string;
    email?: string;
    elo: number;
    wins: number;
    losses: number;
    draws?: number;
    photoURL?: string;
}

export default function Leaderboard() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const usersRef = collection(firestore, "users");
                const q = query(usersRef, orderBy("elo", "desc"), limit(100));
                const snapshot = await getDocs(q);

                const playersList: Player[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    
                    playersList.push({
                        uid: doc.id,
                        name: getDisplayName({
                            displayName: data.displayName,
                            name: data.name,
                            email: data.email,
                            uid: doc.id,
                        }),
                        displayName: data.displayName,
                        email: data.email,
                        elo: data.elo || 1200,
                        wins: data.wins || 0,
                        losses: data.losses || 0,
                        draws: data.draws || 0,
                        photoURL: data.photoURL || DEFAULT_AVATAR,
                    });
                });

                setPlayers(playersList);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
            <LeaderboardHeader playerCount={players.length} />

            <div className="max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <LoadingState />
                ) : players.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-3">
                        <Podium players={players} />
                        <LeaderboardTable players={players} />
                    </div>
                )}
            </div>
        </div>
    );
}