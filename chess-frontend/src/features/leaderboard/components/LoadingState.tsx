export default function LoadingState() {
    return (
        <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="text-emerald-300/70 mt-4">Loading leaderboard...</p>
        </div>
    );
}
