import type { User } from "firebase/auth";
import type { Game, Player } from "../types/index";

export function getBoardOrientation(currentUser: User | null, gameData: Game | null): "white" | "black" {
    const isWhite = currentUser?.uid === gameData?.players?.white?.uid;
    return isWhite ? "white" : "black";
}

export function getPlayer(
    currentUser: User | null,
    gameData: Game | null,
    position: "top" | "bottom"
): Player | undefined {
    const isWhite = currentUser?.uid === gameData?.players?.white?.uid;

    if (position === "bottom") {
        return isWhite ? gameData?.players?.white : gameData?.players?.black;
    }
    return isWhite ? gameData?.players?.black : gameData?.players?.white;
}

export function getPlayerColor(
    currentUser: User | null,
    gameData: Game | null,
    position: "top" | "bottom"
): "white" | "black" {
    const isWhite = currentUser?.uid === gameData?.players?.white?.uid;

    if (position === "bottom") {
        return isWhite ? "white" : "black";
    }
    return isWhite ? "black" : "white";
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

export function getPlayerData(
    currentUser: User | null,
    gameData: Game | null,
    position: "top" | "bottom"
) {
    const player = getPlayer(currentUser, gameData, position);
    const playerColor = getPlayerColor(currentUser, gameData, position);
    const { startingElo, currentElo, eloChange } = getPlayerEloData(gameData, playerColor, player);
    const initialTime = gameData?.timeLeft?.[playerColor] ?? 0;
    const active = gameData?.turn === playerColor &&
                   gameData?.status !== "ended" &&
                   gameData?.status !== "waiting";

    return {
        player,
        playerColor,
        startingElo,
        currentElo,
        eloChange,
        initialTime,
        active,
    };
}
