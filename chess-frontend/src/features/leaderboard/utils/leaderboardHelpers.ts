export function getRankMedal(rank: number): string {
    switch (rank) {
        case 1:
            return "🥇";
        case 2:
            return "🥈";
        case 3:
            return "🥉";
        default:
            return `#${rank}`;
    }
}

export function getEloColor(elo: number): string {
    if (elo >= 2400) return "text-purple-400";
    if (elo >= 2200) return "text-red-400";
    if (elo >= 2000) return "text-orange-400";
    if (elo >= 1800) return "text-yellow-400";
    if (elo >= 1600) return "text-emerald-400";
    if (elo >= 1400) return "text-blue-400";
    return "text-slate-400";
}

export function getEloRank(elo: number): string {
    if (elo >= 2400) return "Grand Master";
    if (elo >= 2200) return "Master";
    if (elo >= 2000) return "Expert";
    if (elo >= 1800) return "Advanced";
    if (elo >= 1600) return "Intermediate";
    if (elo >= 1400) return "Beginner";
    return "Novice";
}

export function calculateWinRate(wins: number, losses: number): string {
    const totalGames = wins + losses;
    return totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";
}

export function getDisplayName(data: {
    displayName?: string;
    name?: string;
    email?: string;
    uid: string;
}): string {
    if (data.displayName) return data.displayName;
    if (data.name) return data.name;
    if (data.email) return data.email;
    return `Guest ${data.uid.slice(1, 5)}`;
}
