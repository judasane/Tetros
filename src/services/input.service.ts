import { Injectable, inject } from '@angular/core';
import { GameActionsService } from './game-actions.service';
import { PowerUpService } from './power-up.service';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root'
})
export class InputService {
  private actions = inject(GameActionsService);
  private powerUps = inject(PowerUpService);
  private state = inject(GameStateService);

  // Timers for Delayed Auto-Shift (DAS) and Auto-Repeat Rate (ARR)
  private dasTimer: any = null;
  private arrTimer: any = null;
  private softDropInterval: any = null;

  private readonly dasDelay = 160; // ms
  private readonly arrInterval = 40;  // ms

  /**
   * Handles a key press event.
   * @param key The key identifier from a KeyboardEvent.
   */
  press(key: string): void {
    if (this.state.isAiming()) {
      this.powerUps.handleAimerKeys(key);
      return;
    }
    if (this.state.gameState() !== 'playing') return;

    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        if (this.dasTimer || this.arrTimer) return;
        const move = () => key === 'ArrowLeft' ? this.actions.moveLeft() : this.actions.moveRight();
        move();
        this.dasTimer = setTimeout(() => {
          this.arrTimer = setInterval(move, this.arrInterval);
        }, this.dasDelay);
        break;
      case 'ArrowDown':
        if (this.softDropInterval) return;
        this.state.softDropActive.set(true);
        this.actions.softDrop();
        this.softDropInterval = setInterval(() => {
            this.actions.softDrop();
        }, this.arrInterval);
        break;
      case 'ArrowUp':
        this.actions.rotate();
        break;
      case ' ': // Spacebar
        this.actions.hardDrop();
        break;
      case 'c':
      case 'C':
        this.actions.hold();
        break;
      case '1': this.powerUps.activatePowerUp('laser'); break;
      case '2': this.powerUps.activatePowerUp('slow'); break;
      case '3': this.powerUps.activatePowerUp('mutate'); break;
      case '4': this.powerUps.activatePowerUp('aimer'); break;
    }
  }

  /**
   * Handles a key release event.
   * @param key The key identifier from a KeyboardEvent.
   */
  release(key: string): void {
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        clearTimeout(this.dasTimer);
        clearInterval(this.arrTimer);
        this.dasTimer = null;
        this.arrTimer = null;
        break;
      case 'ArrowDown':
        clearInterval(this.softDropInterval);
        this.softDropInterval = null;
        this.state.softDropActive.set(false);
        break;
    }
  }

  /**
   * Clears all active movement timers. Useful when the game is paused or reset.
   */
  clearTimers(): void {
    clearTimeout(this.dasTimer);
    clearInterval(this.arrTimer);
    clearInterval(this.softDropInterval);
    this.dasTimer = null;
    this.arrTimer = null;
    this.softDropInterval = null;
    if(this.state.softDropActive()) {
        this.state.softDropActive.set(false);
    }
  }
}
