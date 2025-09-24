import { describe, it, expect } from 'vitest';
import { rotate } from './piece.utils';
import { Piece } from './piece.interface';

describe('PieceUtils', () => {
  describe('rotate', () => {
    // Helper function to create a piece for testing
    const createTestPiece = (shape: number[][]): Piece => ({
      x: 0,
      y: 0,
      shape,
    });

    it('should correctly rotate the J piece', () => {
      const jPiece = createTestPiece([[2, 0, 0], [2, 2, 2]]);
      const rotated = rotate(jPiece);
      expect(rotated.shape).toEqual([[2, 2], [2, 0], [2, 0]]);
    });

    it('should correctly rotate the L piece', () => {
      const lPiece = createTestPiece([[0, 0, 3], [3, 3, 3]]);
      const rotated = rotate(lPiece);
      expect(rotated.shape).toEqual([[3, 0], [3, 0], [3, 3]]);
    });

    it('should correctly rotate the S piece', () => {
      const sPiece = createTestPiece([[0, 5, 5], [5, 5, 0]]);
      const rotated = rotate(sPiece);
      expect(rotated.shape).toEqual([[5, 0], [5, 5], [0, 5]]);
    });

    it('should correctly rotate the T piece', () => {
      const tPiece = createTestPiece([[0, 6, 0], [6, 6, 6]]);
      const rotated = rotate(tPiece);
      expect(rotated.shape).toEqual([[6, 0], [6, 6], [6, 0]]);
    });

    it('should correctly rotate the Z piece', () => {
      const zPiece = createTestPiece([[7, 7, 0], [0, 7, 7]]);
      const rotated = rotate(zPiece);
      expect(rotated.shape).toEqual([[0, 7], [7, 7], [7, 0]]);
    });

    // The 'O' piece is symmetrical, but we can test it for completeness
    it('should not change the shape of the O piece after four rotations', () => {
        const oPiece = createTestPiece([[4, 4], [4, 4]]);
        let rotated = rotate(oPiece);
        rotated = rotate(rotated);
        rotated = rotate(rotated);
        rotated = rotate(rotated);
        expect(rotated.shape).toEqual([[4, 4], [4, 4]]);
      });
  });
});