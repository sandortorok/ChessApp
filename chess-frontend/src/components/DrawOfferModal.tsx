interface DrawOfferModalProps {
    opponentName: string;
    onAccept: () => void;
    onDecline: () => void;
}

export default function DrawOfferModal({ opponentName, onAccept, onDecline }: DrawOfferModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-teal-500/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center border-2 border-teal-500/40">
                        <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-white mb-2">
                    Döntetlen ajánlat
                </h2>

                {/* Message */}
                <p className="text-slate-300 text-center mb-6">
                    <span className="font-semibold text-teal-300">{opponentName}</span> döntetlent ajánlott fel.
                    <br />
                    Elfogadod?
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-6 py-3 bg-red-600/30 hover:bg-red-600/50 text-red-300 hover:text-red-200 font-semibold rounded-xl border border-red-600/40 hover:border-red-500/60 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        Elutasítom
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 px-6 py-3 bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 hover:text-teal-200 font-semibold rounded-xl border border-teal-600/40 hover:border-teal-500/60 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        Elfogadom
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
