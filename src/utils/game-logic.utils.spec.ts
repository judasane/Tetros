import { describe, it, expect } from 'vitest';
import { clearLines, calculateScore } from './game-logic.utils';
import { COLS, ROWS } from './constants';

describe('GameLogicUtils', () => {
  describe('clearLines', () => {
    it('should return the same board and 0 lines cleared when no lines are full', () => {
      const board = Array(ROWS).fill(Array(COLS).fill(0));
      const { boardAfterClear, lines } = clearLines(board);
      expect(lines).toBe(0);
      expect(boardAfterClear).toEqual(board);
    });

    it('should clear one full line and add a new empty line at the top', () => {
      const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
      board[ROWS - 1] = Array(COLS).fill(1); // Full line at the bottom

      const { boardAfterClear, lines } = clearLines(board);

      const expectedBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));

      expect(lines).toBe(1);
      expect(boardAfterClear).toEqual(expectedBoard);
      expect(boardAfterClear[0].every(cell => cell === 0)).toBe(true);
    });

    it('should clear multiple non-contiguous lines and compact the board correctly', () => {
        const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        board[ROWS - 1] = Array(COLS).fill(1); // Full line
        board[ROWS - 3] = Array(COLS).fill(1); // Full line
        board[ROWS - 2] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]; // Not full

        const { boardAfterClear, lines } = clearLines(board);

        expect(lines).toBe(2);
        // Expect two new empty lines at the top
        expect(boardAfterClear[0].every(cell => cell === 0)).toBe(true);
        expect(boardAfterClear[1].every(cell => cell === 0)).toBe(true);
        // Expect the non-full line to have shifted down
        expect(boardAfterClear[ROWS - 1]).toEqual([1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
      });

      it('should clear a Tetris (4 lines) and return the correct score', () => {
        const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        for (let i = 1; i <= 4; i++) {
          board[ROWS - i] = Array(COLS).fill(2); // Four full lines
        }

        const { boardAfterClear, lines } = clearLines(board);

        const expectedBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));

        expect(lines).toBe(4);
        expect(boardAfterClear).toEqual(expectedBoard);
      });
    });

    describe('calculateScore', () => {
      it('should return the correct score for level 1', () => {
        expect(calculateScore(1, 1)).toBe(100);
        expect(calculateScore(2, 1)).toBe(300);
        expect(calculateScore(3, 1)).toBe(500);
        expect(calculateScore(4, 1)).toBe(800);
      });

      it('should apply the level multiplier correctly', () => {
        // 1 line on level 10 -> 100 * 10 = 1000
        expect(calculateScore(1, 10)).toBe(1000);
        // 4 lines on level 5 -> 800 * 5 = 4000
        expect(calculateScore(4, 5)).toBe(4000);
        // 2 lines on level 7 -> 300 * 7 = 2100
        expect(calculateScore(2, 7)).toBe(2100);
      });

      it('should return 0 for 0 lines cleared', () => {
        expect(calculateScore(0, 10)).toBe(0);
      });
    });
});