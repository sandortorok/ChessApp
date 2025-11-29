import React from "react";

type ButtonVariant = "orange" | "emerald" | "red";

interface GameActionButtonProps {
    onClick: () => void;
    variant: ButtonVariant;
    icon: string;
    label: string;
}

const variantStyles: Record<ButtonVariant, string> = {
    orange: "bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 hover:text-orange-200 border-orange-600/30 hover:border-orange-500/50",
    emerald: "bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-emerald-200 border-emerald-600/30 hover:border-emerald-500/50",
    red: "bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-red-200 border-red-600/30 hover:border-red-500/50",
};

export default function GameActionButton({ onClick, variant, icon, label }: GameActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`relative px-6 py-2.5 font-semibold rounded-lg border transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ${variantStyles[variant]}`}
        >
            <span className="relative flex items-center gap-2">
                {icon} {label}
            </span>
        </button>
    );
}
