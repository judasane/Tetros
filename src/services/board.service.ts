import { Injectable, inject } from '@angular/core';
import { GameStateService } from './game-state.service';
import { clearLines } from '../utils/game-logic.utils';
import { Piece } from '../utils/piece.interface';
import { applyGravityToColumn } from '../utils/board.utils';
import { COLS } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private state = inject(GameStateService);

  /**
   * Creates a new board matrix with a piece permanently added.
   * @param piece The piece to add.
   * @param board The board to add the piece to.
   * @returns A new 2D array representing the board.
   */
  getBoardWithPiece(piece: Piece, board: number[][]): number[][] {
    const newBoard = board.map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = value;
          }
        }
      });
    });
    return newBoard;
  }

  /**
   * Processes a board, clearing any completed lines. It relies on a utility function
   * to perform the actual clearing.
   * @param board The board to process.
   * @returns An object containing the new board and the number of lines cleared.
   */
  clearCompletedLines(board: number[][]): { boardAfterClear: number[][], linesCleared: number } {
    const { boardAfterClear, lines } = clearLines(board);
    return { boardAfterClear, linesCleared: lines };
  }

  /**
   * Applies gravity to a single column of the current board state and updates the board.
   * Used by the 'aimer' power-up.
   * @param columnIndex The index of the column to apply gravity to.
   */
  applyGravityToColumn(columnIndex: number): void {
    this.state.board.update(board => {
        const newBoard = board.map(row => [...row]);
        applyGravityToColumn(newBoard, columnIndex);
        return newBoard;
    });
  }

  /**
   * Clears a specific row on the board. Used by the 'laser' power-up.
   * @param rowIndex The index of the row to clear.
   */
  clearRow(rowIndex: number): void {
    this.state.board.update(board => {
        const newBoard = board.map(row => [...row]);
        if (newBoard[rowIndex]) {
            newBoard[rowIndex] = new Array(COLS).fill(0);
        }
        return newBoard;
    });
  }
}
