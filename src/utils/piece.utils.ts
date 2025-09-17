/**
 * @fileoverview Utility functions for creating and manipulating Tetris pieces.
 */

import { COLS } from './constants';
import { Piece } from './piece.interface';

/**
 * Defines the shapes and color indices of all available Tetris pieces.
 */
const PIECES = [
  { shape: [[1, 1, 1, 1]], color: 1 }, // I
  { shape: [[2, 0, 0], [2, 2, 2]], color: 2 }, // J
  { shape: [[0, 0, 3], [3, 3, 3]], color: 3 }, // L
  { shape: [[4, 4], [4, 4]], color: 4 }, // O
  { shape: [[0, 5, 5], [5, 5, 0]], color: 5 }, // S
  { shape: [[0, 6, 0], [6, 6, 6]], color: 6 }, // T
  { shape: [[7, 7, 0], [0, 7, 7]], color: 7 }, // Z
];

/**
 * Creates a new, randomly selected Tetris piece at the top-center of the board.
 * @returns A new Piece object.
 */
export function getRandomPiece(): Piece {
  const type = PIECES[Math.floor(Math.random() * PIECES.length)];
  
  // The shape matrix is populated with the color index instead of just '1'
  const shapeWithColor = type.shape.map(row => row.map(cell => (cell > 0 ? type.color : 0)));

  return {
    x: Math.floor(COLS / 2) - Math.floor(type.shape[0].length / 2),
    y: 0,
    shape: shapeWithColor,
  };
}

/**
 * Rotates a piece's shape matrix 90 degrees clockwise.
 * @param piece The piece to rotate.
 * @returns A new piece object with the rotated shape.
 */
export function rotate(piece: Piece): Piece {
    const shape = piece.shape;
    // Transpose and reverse rows to achieve rotation
    const newShape = shape[0].map((_, colIndex) => shape.map(row => row[colIndex]).reverse());
    return { ...piece, shape: newShape };
}
