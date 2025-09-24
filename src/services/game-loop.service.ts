import { Injectable, inject, effect } from '@angular/core';
import { GameStateService } from './game-state.service';
import { GameActionsService } from './game-actions.service';
import { PowerUpService } from './power-up.service';

@Injectable({
  providedIn: 'root'
})
export class GameLoopService {
  private state = inject(GameStateService);
  private actions = inject(GameActionsService);
  private powerUps = inject(PowerUpService);

  private lastTime = 0;
  private dropCounter = 0;
  private frameId: number | null = null;

  constructor() {
    effect(() => {
      // When the user initiates a soft drop, reset the automatic drop counter
      // to provide immediate feedback and prevent a double drop.
      if (this.state.softDropActive()) {
        this.resetCounter();
      }
    });
  }

  start(): void {
    if (this.frameId) return;
    // Don't reset time here, let the caller decide.
    this.frameId = requestAnimationFrame((time) => this.loop(time));
  }

  stop(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.frameId = null;
  }

  resetTime(): void {
    this.lastTime = 0;
  }

  private resetCounter(): void {
    this.dropCounter = 0;
  }

  private loop(time: number): void {
    if (this.state.gameState() !== 'playing') {
      this.stop();
      return;
    }

    if (this.lastTime === 0) {
      this.lastTime = time;
    }
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.dropCounter += deltaTime;

    const dropInterval = (1000 / this.state.level()) * (this.powerUps.isSlowMotionActive() ? 3 : 1);

    if (!this.state.softDropActive()) {
      while (this.dropCounter >= dropInterval) {
        this.actions.tick();
        if (this.state.gameState() !== 'playing') {
          this.state.dropProgress.set(0);
          this.stop();
          return;
        }
        this.dropCounter -= dropInterval;
      }
    }

    if (this.state.currentPiece()) {
      if (this.actions.canMoveDown()) {
        this.state.dropProgress.set(Math.min(1, this.dropCounter / dropInterval));
      } else {
        this.state.dropProgress.set(0);
      }
    } else {
      this.state.dropProgress.set(0);
    }

    this.frameId = requestAnimationFrame((t) => this.loop(t));
  }
}
