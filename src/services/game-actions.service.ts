import { Injectable, inject } from '@angular/core';
import { GameStateService } from './game-state.service';
import { BoardService } from './board.service';
import { AnimationService } from './animation.service';
import { Piece } from '../utils/piece.interface';
import { getRandomPiece, rotate } from '../utils/piece.utils';
import { isValidPosition, calculateScore } from '../utils/game-logic.utils';
import { LEVEL_THRESHOLD, COLS, LINE_CLEAR_ANIMATION_DURATION } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class GameActionsService {
  private state = inject(GameStateService);
  private boardService = inject(BoardService);
  private animationService = inject(AnimationService);

  /**
   * The main tick of the game, attempting to move the piece down.
   * If the piece cannot move down, it gets locked.
   * This is intended to be called by the GameLoopService.
   */
  tick(): void {
    if (!this.movePiece(0, 1)) {
      this.lockPiece();
    }
  }

  // --- Player Actions ---

  moveLeft(): void {
    this.movePiece(-1, 0);
  }

  moveRight(): void {
    this.movePiece(1, 0);
  }

  softDrop(): void {
    this.tick();
    // The drop counter reset will be handled by the game loop service
    // to avoid a dependency from Actions -> Loop.
    this.state.dropProgress.set(0);
  }

  hardDrop(): void {
    const piece = this.state.currentPiece();
    const ghost = this.animationService.ghostPiece();
    if (piece && ghost) {
      this.state.currentPiece.set({ ...piece, y: ghost.y });
      this.lockPiece();
    }
  }

  rotate(): void {
    const piece = this.state.currentPiece();
    if (!piece) return;

    const rotatedPiece = rotate(piece);
    const kicks = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 2, y: 0 }, { x: -2, y: 0 }, { x: 0, y: -1 }
    ];

    for (const kick of kicks) {
      const kickedPiece = {
        ...rotatedPiece,
        x: rotatedPiece.x + kick.x,
        y: rotatedPiece.y + kick.y
      };
      if (isValidPosition(kickedPiece, this.state.board())) {
        this.state.currentPiece.set(kickedPiece);
        return;
      }
    }
  }

  hold(): void {
    if (!this.state.isHoldingAllowed() || this.state.gameState() !== 'playing') return;

    const current = this.state.currentPiece();
    const held = this.state.holdPiece();

    this.state.holdPiece.set({ ...current!, x: 3, y: 0 });
    if (held) {
      this.state.currentPiece.set({ ...held, x: 3, y: 0 });
    } else {
      this.spawnNewPiece();
    }
    this.state.isHoldingAllowed.set(false);
  }

  // --- Internal Game Logic ---

  private movePiece(dx: number, dy: number): boolean {
    const piece = this.state.currentPiece();
    if (!piece) return false;

    const newPiece = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (isValidPosition(newPiece, this.state.board())) {
      this.state.currentPiece.set(newPiece);
      return true;
    }
    return false;
  }

  private lockPiece(): void {
    const piece = this.state.currentPiece();
    if (!piece) return;

    const boardWithPiece = this.boardService.getBoardWithPiece(piece, this.state.board());

    const linesToClear: number[] = [];
    boardWithPiece.forEach((row, y) => {
        if (row.every(cell => cell > 0)) {
            linesToClear.push(y);
        }
    });

    if (linesToClear.length > 0) {
      this.state.gameState.set('clearing');
      this.state.currentPiece.set(null);

      const animationBoard = boardWithPiece.map((row, y) => {
        if (linesToClear.includes(y)) {
          return Array(COLS).fill(-3); // Use special value for clearing animation
        }
        return row;
      });
      this.state.board.set(animationBoard);

      setTimeout(() => {
        const { boardAfterClear, linesCleared } = this.boardService.clearCompletedLines(boardWithPiece);
        this.state.board.set(boardAfterClear);

        this.state.score.update(s => s + calculateScore(linesCleared, this.state.level()));
        this.state.linesCleared.update(l => l + linesCleared);
        this.state.level.set(Math.floor(this.state.linesCleared() / LEVEL_THRESHOLD) + 1);
        this.state.powerUps.update(p => ({ laser: p.laser + 1, slow: p.slow + 1, mutate: p.mutate + 1, aimer: p.aimer + 1 }));

        this.spawnNewPiece();
        this.state.isHoldingAllowed.set(true);
        this.state.gameState.set('playing');
      }, LINE_CLEAR_ANIMATION_DURATION);
    } else {
      this.state.board.set(boardWithPiece);
      this.spawnNewPiece();
      this.state.isHoldingAllowed.set(true);
    }
  }

  private spawnNewPiece(): void {
    this.state.dropProgress.set(0);
    this.state.currentPiece.set(this.state.nextPiece());
    this.state.nextPiece.set(getRandomPiece());

    if (!isValidPosition(this.state.currentPiece()!, this.state.board())) {
      this.state.gameState.set('gameover');
    }
  }

  /**
   * Checks if the current piece can move down.
   * Public so other services (like GameLoop) can use it for calculations.
   */
  public canMoveDown(): boolean {
    const piece = this.state.currentPiece();
    if (!piece) return false;
    const newPiece = { ...piece, y: piece.y + 1 };
    return isValidPosition(newPiece, this.state.board());
  }
}
