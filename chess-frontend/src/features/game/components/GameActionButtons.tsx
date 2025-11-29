
import GameActionButton from "./GameActionButton";

interface GameActionButtonsProps {
    moveHistoryLength: number;
    onAbort: () => void;
    onOfferDraw: () => void;
    onSurrender: () => void;
}

export default function GameActionButtons({
    moveHistoryLength,
    onAbort,
    onOfferDraw,
    onSurrender,
}: GameActionButtonsProps) {
    return (
        <div className="flex gap-3 justify-center items-center py-2">
            {moveHistoryLength <= 1 && (
                <GameActionButton
                    onClick={onAbort}
                    variant="orange"
                    icon="⛔"
                    label="Megszakítás"
                />
            )}

            {moveHistoryLength > 1 && (
                <>
                    <GameActionButton
                        onClick={onOfferDraw}
                        variant="emerald"
                        icon="🤝"
                        label="Döntetlen"
                    />

                    <GameActionButton
                        onClick={onSurrender}
                        variant="red"
                        icon="🏳️"
                        label="Feladás"
                    />
                </>
            )}
        </div>
    );
}
