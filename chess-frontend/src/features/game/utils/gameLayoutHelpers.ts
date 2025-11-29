import type { User } from "firebase/auth";
import type { Game, Player } from "../types/index";

export function getGameLayout(currentUser: User | null, gameData: Game | null) {
    const isWhite = currentUser?.uid === gameData?.players?.white?.uid;
    const boardOrientation: "white" | "black" = isWhite ? "white" : "black";

    const topPlayer = isWhite ? gameData?.players?.black : gameData?.players?.white;
    const bottomPlayer = isWhite ? gameData?.players?.white : gameData?.players?.black;

    const topPlayerColor: "white" | "black" = isWhite ? "black" : "white";
    const bottomPlayerColor: "white" | "black" = isWhite ? "white" : "black";

    return {
        isWhite,
        boardOrientation,
        topPlayer,
        bottomPlayer,
        topPlayerColor,
        bottomPlayerColor,
    } as const;
}

export function getPlayerEloData(
    gameData: Game | null,
    playerColor: "white" | "black",
    player: Player | undefined
) {
    const startingElo = gameData?.startingElo?.[playerColor];
    const currentElo =
        gameData?.finalElo?.[playerColor] ||
        gameData?.startingElo?.[playerColor] ||
        player?.elo;

    const eloChange =
        (gameData?.finalElo?.[playerColor] && gameData?.startingElo?.[playerColor])
            ? gameData.finalElo[playerColor] - gameData.startingElo[playerColor]
            : 0;

    return {
        startingElo,
        currentElo,
        eloChange,
    };
}
