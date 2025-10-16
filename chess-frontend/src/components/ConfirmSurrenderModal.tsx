interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: "danger" | "warning" | "info";
}

export default function ConfirmSurrenderModal({
    isOpen,
    title,
    message,
    confirmText = "Megerősítés",
    cancelText = "Mégse",
    onConfirm,
    onCancel,
    type = "danger"
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getTypeColors = () => {
        switch (type) {
            case "danger":
                return {
                    icon: "🚨",
                    iconBg: "bg-red-500/20",
                    iconBorder: "border-red-500/50",
                    confirmBg: "bg-red-600/20 hover:bg-red-600/40",
                    confirmText: "text-red-300 hover:text-red-200",
                    confirmBorder: "border-red-600/30 hover:border-red-500/50"
                };
            case "warning":
                return {
                    icon: "⚠️",
                    iconBg: "bg-amber-500/20",
                    iconBorder: "border-amber-500/50",
                    confirmBg: "bg-amber-600/20 hover:bg-amber-600/40",
                    confirmText: "text-amber-300 hover:text-amber-200",
                    confirmBorder: "border-amber-600/30 hover:border-amber-500/50"
                };
            case "info":
                return {
                    icon: "ℹ️",
                    iconBg: "bg-emerald-500/20",
                    iconBorder: "border-emerald-500/50",
                    confirmBg: "bg-emerald-600/20 hover:bg-emerald-600/40",
                    confirmText: "text-emerald-300 hover:text-emerald-200",
                    confirmBorder: "border-emerald-600/30 hover:border-emerald-500/50"
                };
        }
    };

    const colors = getTypeColors();

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-emerald-600/30 shadow-2xl shadow-emerald-500/20 max-w-md w-full animate-scaleIn">
                {/* Icon */}
                <div className="flex justify-center pt-8 pb-4">
                    <div className={`w-20 h-20 rounded-full ${colors.iconBg} border-4 ${colors.iconBorder} flex items-center justify-center text-4xl animate-bounce`}>
                        {colors.icon}
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">
                        {title}
                    </h2>
                    <p className="text-slate-300 text-base leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Buttons */}
                <div className="border-t border-emerald-600/30 px-6 py-4 flex gap-3 justify-end bg-slate-900/50">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-emerald-300 hover:text-white font-semibold rounded-lg border border-slate-600 hover:border-emerald-600/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`group relative px-8 py-2.5 ${colors.confirmBg} ${colors.confirmText} font-semibold rounded-lg border ${colors.confirmBorder} transition-all duration-200 transform hover:scale-105 active:scale-95 overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative">{confirmText}</span>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
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
