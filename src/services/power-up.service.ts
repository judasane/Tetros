import { Injectable, inject } from '@angular/core';
import { GameStateService, PowerUp } from './game-state.service';
import { BoardService } from './board.service';
import { getRandomPiece } from '../utils/piece.utils';
import { ROWS, COLS, SLOW_POWERUP_DURATION } from '../utils/constants';
import { GameLoopService } from './game-loop.service';

@Injectable({
  providedIn: 'root'
})
export class PowerUpService {
  private state = inject(GameStateService);
  private boardService = inject(BoardService);
  // Injected here to restart the loop after the aimer power-up is used.
  private loopService: GameLoopService;

  private slowMotionActive = false;

  constructor() {
    // Manually inject to handle potential circular dependencies, although none exist in this path.
    this.loopService = inject(GameLoopService);
  }

  isSlowMotionActive(): boolean {
    return this.slowMotionActive;
  }

  /** Resets the internal state of the service. */
  reset(): void {
    this.slowMotionActive = false;
  }

  canUsePowerUp(powerUp: PowerUp): boolean {
    return this.state.powerUps()[powerUp] > 0 && this.state.gameState() === 'playing' && !this.state.isAiming();
  }

  activatePowerUp(powerUp: PowerUp): void {
    if (!this.canUsePowerUp(powerUp)) return;

    this.state.powerUps.update(p => ({...p, [powerUp]: p[powerUp] - 1}));

    switch(powerUp) {
      case 'laser':
        const piece = this.state.currentPiece();
        if (!piece) return;
        // Find the lowest occupied row of the piece for more accurate targeting
        let bottomRow = piece.y;
        for (let row = piece.shape.length - 1; row >= 0; row--) {
          if (piece.shape[row].some(cell => cell > 0)) {
            bottomRow = piece.y + row;
            break;
          }
        }
        const y = Math.min(ROWS - 1, bottomRow + 1); // +1 to destroy the row just below the piece
        this.boardService.clearRow(y);
        break;
      case 'slow':
        this.slowMotionActive = true;
        setTimeout(() => this.slowMotionActive = false, SLOW_POWERUP_DURATION);
        break;
      case 'mutate':
        this.state.currentPiece.set(getRandomPiece());
        this.state.nextPiece.set(getRandomPiece());
        break;
      case 'aimer':
        this.state.isAiming.set(true);
        this.state.gameState.set('paused');
        this.updateAimerBoard();
        break;
    }
  }

  handleAimerKeys(key: string): void {
    if (!this.state.isAiming()) return;

    if (key === 'Enter') {
      this.executeAimer();
      return;
    }

    this.state.aimerPosition.update(pos => {
      let { x, y } = pos;
      if (key === 'ArrowLeft') x = Math.max(0, x - 1);
      if (key === 'ArrowRight') x = Math.min(COLS - 1, x + 1);
      if (key === 'ArrowUp') y = Math.max(0, y - 1);
      if (key === 'ArrowDown') y = Math.min(ROWS - 1, y + 1);
      return { x, y };
    });
    this.updateAimerBoard();
  }

  private updateAimerBoard(): void {
    const { x, y } = this.state.aimerPosition();
    this.state.board.update(b => {
      const newBoard = b.map(row => row.map(cell => cell === -2 ? 0 : cell));
      if (newBoard[y] && newBoard[y][x] !== undefined) {
        newBoard[y][x] = -2;
      }
      return newBoard;
    });
  }

  private executeAimer(): void {
    this.state.isAiming.set(false);
    const { x, y } = this.state.aimerPosition();

    // First, clean the visual marker and destroy the target cell
    this.state.board.update(b => {
      const newBoard = b.map(row => row.map(cell => cell === -2 ? 0 : cell));
      if (newBoard[y] && newBoard[y][x] !== undefined) {
        newBoard[y][x] = 0; // Destroy the target cell
      }
      return newBoard;
    });

    // Then apply gravity to the column
    this.boardService.applyGravityToColumn(x);

    this.state.gameState.set('playing');
    this.loopService.resetTime();
    this.loopService.start();
  }
}
