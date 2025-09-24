import { Injectable, inject } from '@angular/core';
import { GameStateService, PowerUp } from './game-state.service';
import { GameActionsService } from './game-actions.service';
import { GameLoopService } from './game-loop.service';
import { InputService } from './input.service';
import { PowerUpService } from './power-up.service';
import { AnimationService } from './animation.service';
import { createEmptyBoard } from '../utils/board.utils';
import { getRandomPiece } from '../utils/piece.utils';
import { COLS, ROWS } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class GameFacade {
  private state = inject(GameStateService);
  private actions = inject(GameActionsService);
  private loop = inject(GameLoopService);
  private input = inject(InputService);
  private powerUpService = inject(PowerUpService);
  private animation = inject(AnimationService);

  private countdownIntervalId: any = null;

  // --- State Signals (exposed as readonly) ---
  readonly board = this.state.board.asReadonly();
  readonly currentPiece = this.state.currentPiece.asReadonly();
  readonly nextPiece = this.state.nextPiece.asReadonly();
  readonly holdPiece = this.state.holdPiece.asReadonly();
  readonly gameState = this.state.gameState.asReadonly();
  readonly score = this.state.score.asReadonly();
  readonly level = this.state.level.asReadonly();
  readonly linesCleared = this.state.linesCleared.asReadonly();
  readonly countdownValue = this.state.countdownValue.asReadonly();
  readonly powerUps = this.state.powerUps.asReadonly();
  readonly isAiming = this.state.isAiming.asReadonly();
  readonly dropProgress = this.state.dropProgress.asReadonly();
  readonly animationMode = this.state.animationMode.asReadonly();
  readonly ghostPiece = this.animation.ghostPiece;

  // --- Action Methods (for touch controls) ---
  readonly moveLeft = this.actions.moveLeft.bind(this.actions);
  readonly moveRight = this.actions.moveRight.bind(this.actions);
  readonly softDrop = this.actions.softDrop.bind(this.actions);
  readonly hardDrop = this.actions.hardDrop.bind(this.actions);
  readonly rotate = this.actions.rotate.bind(this.actions);
  readonly hold = this.actions.hold.bind(this.actions);

  // --- Input Methods (for keyboard controls) ---
  pressKey(key: string): void {
    if (this.state.isAiming()) {
      this.powerUpService.handleAimerKeys(key);

      if (key === 'Enter') {
        this.loop.resetTime();
        this.loop.start();
      }
    } else {
      this.input.press(key);
    }
  }
  releaseKey(key: string) { this.input.release(key); }

  // --- PowerUp Methods ---
  activatePowerUp(powerUp: PowerUp) { this.powerUpService.activatePowerUp(powerUp); }
  canUsePowerUp = this.powerUpService.canUsePowerUp.bind(this.powerUpService);

  // --- Animation Methods ---
  toggleAnimationMode() { this.animation.toggleAnimationMode(); }

  // --- Orchestration Methods ---
  startGame(): void {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
    }
    this.input.clearTimers();
    this.powerUpService.reset();

    // Reset all state
    this.state.board.set(createEmptyBoard());
    this.state.currentPiece.set(getRandomPiece());
    this.state.nextPiece.set(getRandomPiece());
    this.state.holdPiece.set(null);
    this.state.score.set(0);
    this.state.level.set(1);
    this.state.linesCleared.set(0);
    this.state.isHoldingAllowed.set(true);
    this.state.powerUps.set({ laser: 1, slow: 1, mutate: 1, aimer: 1 });
    this.state.isAiming.set(false);
    this.state.aimerPosition.set({ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) });
    this.state.dropProgress.set(0);

    this.state.gameState.set('countdown');
    this.state.countdownValue.set(3);

    this.countdownIntervalId = setInterval(() => {
      this.state.countdownValue.update(v => v - 1);
      if (this.state.countdownValue() <= 0) {
        clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = null;
        this.state.gameState.set('playing');
        this.loop.resetTime();
        this.loop.start();
      }
    }, 1000);
  }

  togglePause(): void {
    if (this.state.gameState() === 'playing') {
      this.state.gameState.set('paused');
      this.loop.stop();
      this.input.clearTimers();
    } else if (this.state.gameState() === 'paused') {
      this.state.gameState.set('playing');
      this.loop.resetTime(); // Prevent sudden drop after unpausing
      this.loop.start();
    }
  }
}
