import { useState } from "react";

interface CreateGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (settings: GameSettings) => void;
}

export interface GameSettings {
    timeControl: number; // percben
    increment: number; // másodpercben
    opponentType: "human" | "ai";
}

const timeControlOptions = [
    { label: "1+0", time: 1, increment: 0 },
    { label: "1+1", time: 1, increment: 1 },
    { label: "3+0", time: 3, increment: 0 },
    { label: "3+2", time: 3, increment: 2 },
    { label: "5+0", time: 5, increment: 0 },
    { label: "5+3", time: 5, increment: 3 },
    { label: "10+0", time: 10, increment: 0 },
    { label: "10+5", time: 10, increment: 5 },
    { label: "15+10", time: 15, increment: 10 },
    { label: "30+0", time: 30, increment: 0 },
];

export default function CreateGameModal({ isOpen, onClose, onCreate }: CreateGameModalProps) {
    const [selectedTimeControl, setSelectedTimeControl] = useState(timeControlOptions[4]); // 5+0 alapértelmezett
    const [opponentType, setOpponentType] = useState<"human" | "ai">("human");

    if (!isOpen) return null;

    const handleCreate = () => {
        onCreate({
            timeControl: selectedTimeControl.time,
            increment: selectedTimeControl.increment,
            opponentType,
        });
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-slate-800 rounded-2xl border border-emerald-600/30 shadow-2xl shadow-emerald-500/20 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-emerald-600/30 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-3xl">⚙️</span>
                            Új játék létrehozása
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 hover:bg-slate-700/50 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Időkontroll választás */}
                    <div>
                        <label className="block text-emerald-300 font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Időkontroll
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {timeControlOptions.map((option) => (
                                <button
                                    key={option.label}
                                    onClick={() => setSelectedTimeControl(option)}
                                    className={`py-3 px-4 rounded-lg font-mono font-bold text-center transition-all duration-200 border-2 ${
                                        selectedTimeControl.label === option.label
                                            ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/50 scale-105"
                                            : "bg-slate-700/50 text-emerald-300 border-slate-600 hover:border-emerald-600/50 hover:bg-slate-700"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-emerald-300/60 text-sm mt-3">
                            {selectedTimeControl.time} perc + {selectedTimeControl.increment} másodperc lépésenként
                        </p>
                    </div>

                    {/* Ellenfél típus választás */}
                    <div>
                        <label className="block text-emerald-300 font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Ellenfél típusa
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setOpponentType("human")}
                                className={`group relative py-6 px-4 rounded-xl font-semibold text-center transition-all duration-200 border-2 overflow-hidden ${
                                    opponentType === "human"
                                        ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/50"
                                        : "bg-slate-700/50 text-emerald-300 border-slate-600 hover:border-emerald-600/50 hover:bg-slate-700"
                                }`}
                            >
                                <div className="relative z-10">
                                    <div className="text-3xl mb-2">👤</div>
                                    <div className="text-lg">Ember</div>
                                    <div className="text-xs opacity-70 mt-1">Játék másik játékos ellen</div>
                                </div>
                                {opponentType === "human" && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent" />
                                )}
                            </button>

                            <button
                                onClick={() => setOpponentType("ai")}
                                className={`group relative py-6 px-4 rounded-xl font-semibold text-center transition-all duration-200 border-2 overflow-hidden ${
                                    opponentType === "ai"
                                        ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/50"
                                        : "bg-slate-700/50 text-emerald-300 border-slate-600 hover:border-emerald-600/50 hover:bg-slate-700"
                                }`}
                            >
                                <div className="relative z-10">
                                    <div className="text-3xl mb-2">🤖</div>
                                    <div className="text-lg">AI</div>
                                    <div className="text-xs opacity-70 mt-1">Játék gépi ellenfél ellen</div>
                                </div>
                                {opponentType === "ai" && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-emerald-600/30 px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-emerald-300 hover:text-white font-semibold rounded-lg border border-slate-600 hover:border-emerald-600/50 transition-all duration-200"
                    >
                        Mégse
                    </button>
                    <button
                        onClick={handleCreate}
                        className="group relative px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Játék létrehozása
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
