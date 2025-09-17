/**
 * @fileoverview Defines the interface for a Tetris piece.
 */

/**
 * Represents a Tetris piece, including its position and shape.
 */
export interface Piece {
  /** The x-coordinate of the piece's top-left corner on the board. */
  x: number;
  /** The y-coordinate of the piece's top-left corner on the board. */
  y: number;
  /** A 2D number array representing the shape and color of the piece. */
  shape: number[][];
}
