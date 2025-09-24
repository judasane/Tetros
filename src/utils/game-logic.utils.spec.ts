import { describe, it, expect } from 'vitest';
import { isValidPosition } from './game-logic.utils';
import { Piece } from './piece.interface';
import { COLS, ROWS } from './constants';
import { createEmptyBoard } from './board.utils';

describe('isValidPosition', () => {
  // Test case 1: A valid position
  it('should return true for a valid position within the board and without collisions', () => {
    const piece: Piece = {
      x: 3,
      y: 4,
      shape: [[1, 1], [1, 1]], // A square piece
    };
    const board = createEmptyBoard();
    expect(isValidPosition(piece, board)).toBe(true);
  });

  // Test case 2: Collision with a border
  it('should return false for a piece colliding with the right border', () => {
    const piece: Piece = {
      x: COLS - 1, // Positioned at the right edge
      y: 4,
      shape: [[1, 1], [1, 1]], // A square piece, part of it will be out of bounds
    };
    const board = createEmptyBoard();
    expect(isValidPosition(piece, board)).toBe(false);
  });

  it('should return false for a piece colliding with the left border', () => {
    const piece: Piece = {
      x: -1, // Positioned at the left edge
      y: 4,
      shape: [[1, 1], [1, 1]],
    };
    const board = createEmptyBoard();
    expect(isValidPosition(piece, board)).toBe(false);
  });

    it('should return false for a piece colliding with the bottom border', () => {
    const piece: Piece = {
      x: 3,
      y: ROWS -1, // Positioned at the bottom edge
      shape: [[1, 1], [1, 1]],
    };
    const board = createEmptyBoard();
    expect(isValidPosition(piece, board)).toBe(false);
  });

  // Test case 3: Collision with another piece
  it('should return false for a piece colliding with an existing piece on the board', () => {
    const piece: Piece = {
      x: 3,
      y: 4,
      shape: [[1, 1], [1, 1]],
    };
    const board = createEmptyBoard();
    // Place a block where the new piece wants to go
    board[5][4] = 2; // y=5, x=4 corresponds to the bottom-left of the piece
    expect(isValidPosition(piece, board)).toBe(false);
  });

  // Edge case: Piece is partially off the top of the board (which is valid)
  it('should return true for a piece that is partially above the board', () => {
    const piece: Piece = {
      x: 3,
      y: -1, // Spawn position, one row is hidden
      shape: [[1, 1], [1, 1]],
    };
    const board = createEmptyBoard();
    expect(isValidPosition(piece, board)).toBe(true);
  });
});
