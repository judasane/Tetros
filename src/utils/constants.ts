/**
 * @fileoverview Defines constants used throughout the game.
 */

/** The number of columns on the game board. */
export const COLS = 10;
/** The number of rows on the game board. */
export const ROWS = 20;

/** The number of lines that must be cleared to advance to the next level. */
export const LEVEL_THRESHOLD = 10;

/**
 * A mapping of piece color indices to their corresponding Tailwind CSS background color classes.
 */
export const PIECE_COLORS: { [key: number]: string } = {
  1: 'cyan-400',    // I
  2: 'blue-600',    // J
  3: 'orange-500',  // L
  4: 'yellow-400',  // O
  5: 'green-500',   // S
  6: 'purple-600',  // T
  7: 'red-600',     // Z
};
