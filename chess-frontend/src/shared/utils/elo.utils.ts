/**
 * ELO calculation utility functions
 */

import { ELO_K_FACTOR } from '../../core/constants';

/**
 * Calculate ELO change after a game
 */
export function calculateEloChange(
    winnerElo: number,
    loserElo: number,
    isDraw: boolean = false
): { winnerChange: number; loserChange: number } {
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    if (isDraw) {
        const winnerChange = Math.round(ELO_K_FACTOR * (0.5 - expectedWinner));
        const loserChange = Math.round(ELO_K_FACTOR * (0.5 - expectedLoser));
        return { winnerChange, loserChange };
    }

    const winnerChange = Math.round(ELO_K_FACTOR * (1 - expectedWinner));
    const loserChange = Math.round(ELO_K_FACTOR * (0 - expectedLoser));
    return { winnerChange, loserChange };
}
