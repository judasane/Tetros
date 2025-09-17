/**
 * @fileoverview Utility functions related to the game board.
 */

import { COLS, ROWS } from './constants';

/**
 * Creates a new, empty game board matrix filled with zeros.
 * @returns A 2D number array representing the empty board.
 */
export function createEmptyBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

/**
 * Applies gravity to a single column after a cell has been removed.
 * This function mutates the board directly.
 * @param board The game board matrix to modify.
 * @param colIndex The index of the column to apply gravity to.
 */
export function applyGravityToColumn(board: number[][], colIndex: number): void {
    let emptyRow = -1;
    // Find the first empty cell from the bottom
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][colIndex] === 0) {
            emptyRow = r;
            break;
        }
    }

    if (emptyRow === -1) return; // Column is full

    // Move cells down
    for (let r = emptyRow - 1; r >= 0; r--) {
        if (board[r][colIndex] !== 0) {
            board[emptyRow][colIndex] = board[r][colIndex];
            board[r][colIndex] = 0;
            emptyRow--;
        }
    }
}
