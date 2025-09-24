import { describe, it, expect } from 'vitest';
import { applyGravityToColumn } from './board.utils';
import { ROWS } from './constants';

describe('BoardUtils', () => {
  describe('applyGravityToColumn', () => {
    // Helper to get a specific column from a board
    const getColumn = (board: number[][], colIndex: number): number[] =>
      board.map(row => row[colIndex]);

    // Helper to create a board from a single column's definition
    const createBoardFromColumn = (column: number[]): number[][] => {
      const board = Array.from({ length: ROWS }, () => Array(1).fill(0));
      for (let i = 0; i < ROWS; i++) {
        board[i][0] = column[i] || 0;
      }
      return board;
    };

    it('should correctly apply gravity to a column with a single gap', () => {
      const initialColumn = [1, 0, 1];
      const board = createBoardFromColumn(initialColumn);
      applyGravityToColumn(board, 0);
      const finalColumn = getColumn(board, 0);
      expect(finalColumn.slice(-3)).toEqual([0, 1, 1]);
    });

    it('should correctly apply gravity to a column with multiple gaps', () => {
      const initialColumn = [1, 0, 1, 0, 1];
      const board = createBoardFromColumn(initialColumn);
      applyGravityToColumn(board, 0);
      const finalColumn = getColumn(board, 0);
      expect(finalColumn.slice(-5)).toEqual([0, 0, 1, 1, 1]);
    });

    it('should not modify a column that is already full', () => {
      const initialColumn = Array(ROWS).fill(1);
      const board = createBoardFromColumn([...initialColumn]);
      applyGravityToColumn(board, 0);
      const finalColumn = getColumn(board, 0);
      expect(finalColumn).toEqual(initialColumn);
    });

    it('should not modify a column that is completely empty', () => {
      const initialColumn = Array(ROWS).fill(0);
      const board = createBoardFromColumn([...initialColumn]);
      applyGravityToColumn(board, 0);
      const finalColumn = getColumn(board, 0);
      expect(finalColumn).toEqual(initialColumn);
    });

    it('should handle complex cases with multiple blocks and gaps', () => {
        const initialColumn = [0, 2, 0, 3, 0, 4, 0, 0, 5, 0];
        const board = createBoardFromColumn(initialColumn);
        applyGravityToColumn(board, 0);
        const finalColumn = getColumn(board, 0);
        expect(finalColumn.slice(-10)).toEqual([0, 0, 0, 0, 0, 0, 2, 3, 4, 5]);
    });
  });
});