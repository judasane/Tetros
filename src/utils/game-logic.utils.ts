/**
 * @fileoverview Core game logic utilities for collision detection, line clearing, and scoring.
 */

import { Piece } from './piece.interface';
import { COLS, ROWS } from './constants';

/**
 * Checks if a piece's position is valid on the board (not out of bounds or colliding with other pieces).
 * @param piece The piece to validate.
 * @param board The current game board.
 * @returns `true` if the position is valid, `false` otherwise.
 */
export function isValidPosition(piece: Piece, board: number[][]): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] > 0) {
        const boardX = piece.x + x;
        const boardY = piece.y + y;

        // Check bounds
        if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
          return false;
        }

        // Check for collision with existing pieces (only for cells within the board's visible area)
        if (boardY >= 0 && board[boardY] && board[boardY][boardX] > 0) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Removes completed lines from the board and adds new empty lines at the top.
 * @param board The board to process.
 * @returns An object containing the new board and the number of lines cleared.
 */
export function clearLines(board: number[][]): { boardAfterClear: number[][], lines: number } {
  let lines = 0;
  const newBoard = board.filter(row => {
    if (row.every(cell => cell > 0)) {
      lines++;
      return false; // This row is full, so filter it out
    }
    return true; // This row is not full, keep it
  });

  // Add new empty rows at the top to maintain board height
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(0));
  }

  return { boardAfterClear: newBoard, lines };
}

/** Base points for clearing 0, 1, 2, 3, or 4 lines at once. */
const LINE_POINTS = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines

/**
 * Calculates the score awarded for clearing lines.
 * @param linesCleared The number of lines cleared at once.
 * @param level The current game level.
 * @returns The calculated score.
 */
export function calculateScore(linesCleared: number, level: number): number {
  return (LINE_POINTS[linesCleared] || 0) * level;
}
