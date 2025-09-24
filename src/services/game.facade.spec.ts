import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { GameFacade } from './game.facade';
import { GameStateService } from './game-state.service';
import { GameActionsService } from './game-actions.service';
import { GameLoopService } from './game-loop.service';
import { InputService } from './input.service';
import { PowerUpService } from './power-up.service';
import { AnimationService } from './animation.service';
import { GameState } from '../utils/game-state.interface';
import { createEmptyBoard } from '../utils/board.utils';

// Mock services
class MockGameStateService {
    board = signal(createEmptyBoard());
    currentPiece = signal(null);
    nextPiece = signal(null);
    holdPiece = signal(null);
    gameState = signal<GameState>('start');
    score = signal(100);
    level = signal(2);
    linesCleared = signal(10);
    isHoldingAllowed = signal(false);
    powerUps = signal({ laser: 0, slow: 0, mutate: 0, aimer: 0 });
    isAiming = signal(true);
    aimerPosition = signal({ x: 0, y: 0 });
    dropProgress = signal(0.5);
    countdownValue = signal(0);
    animationMode = signal<'smooth' | 'step'>('smooth');
  }
class MockGameLoopService {
  start = vi.fn();
  stop = vi.fn();
  resetTime = vi.fn();
}
class MockInputService {
  clearTimers = vi.fn();
  press = vi.fn();
  release = vi.fn();
}
class MockPowerUpService {
    reset = vi.fn();
    canUsePowerUp = vi.fn();
    handleAimerKeys = vi.fn();
    activatePowerUp = vi.fn();
}
class MockGameActionsService {
    moveLeft = vi.fn();
    moveRight = vi.fn();
    softDrop = vi.fn();
    hardDrop = vi.fn();
    rotate = vi.fn();
    hold = vi.fn();
}
class MockAnimationService {
    ghostPiece = signal(null);
    toggleAnimationMode = vi.fn();
}


describe('GameFacade', () => {
  let facade: GameFacade;
  let state: GameStateService;
  let loop: GameLoopService;
  let input: InputService;
  let powerUps: PowerUpService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        GameFacade,
        { provide: GameStateService, useClass: MockGameStateService },
        { provide: GameActionsService, useClass: MockGameActionsService },
        { provide: GameLoopService, useClass: MockGameLoopService },
        { provide: InputService, useClass: MockInputService },
        { provide: PowerUpService, useClass: MockPowerUpService },
        { provide: AnimationService, useClass: MockAnimationService },
      ],
    });

    facade = TestBed.inject(GameFacade);
    state = TestBed.inject(GameStateService);
    loop = TestBed.inject(GameLoopService);
    input = TestBed.inject(InputService);
    powerUps = TestBed.inject(PowerUpService);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('startGame', () => {
    it('should reset all game state signals to their initial values', () => {
        // Set some non-initial values first
        state.score.set(999);
        state.level.set(10);
        state.linesCleared.set(100);
        state.isHoldingAllowed.set(false);
        state.gameState.set('gameOver');

        facade.startGame();

        expect(state.score()).toBe(0);
        expect(state.level()).toBe(1);
        expect(state.linesCleared()).toBe(0);
        expect(state.isHoldingAllowed()).toBe(true);
        expect(state.holdPiece()).toBeNull();
        expect(state.board()).toEqual(createEmptyBoard());
        expect(state.currentPiece()).not.toBeNull();
        expect(state.nextPiece()).not.toBeNull();
        expect(powerUps.reset).toHaveBeenCalled();
        expect(input.clearTimers).toHaveBeenCalled();
    });

    it('should transition gameState from "countdown" to "playing"', async () => {
        facade.startGame();
        expect(state.gameState()).toBe('countdown');
        expect(state.countdownValue()).toBe(3);

        await vi.advanceTimersByTimeAsync(1000);
        expect(state.countdownValue()).toBe(2);

        await vi.advanceTimersByTimeAsync(1000);
        expect(state.countdownValue()).toBe(1);

        await vi.advanceTimersByTimeAsync(1000);
        expect(state.countdownValue()).toBe(0);
        expect(state.gameState()).toBe('playing');
    });

    it('should call loop.start() exactly after the countdown finishes', async () => {
        facade.startGame();
        expect(loop.start).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(2999);
        expect(loop.start).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        expect(loop.resetTime).toHaveBeenCalled();
        expect(loop.start).toHaveBeenCalledTimes(1);
      });
  });

  describe('togglePause', () => {
    it('should change state to "paused", stop the loop, and clear input timers', () => {
        state.gameState.set('playing');
        facade.togglePause();

        expect(state.gameState()).toBe('paused');
        expect(loop.stop).toHaveBeenCalledTimes(1);
        expect(input.clearTimers).toHaveBeenCalledTimes(1);
    });

    it('should change state back to "playing" and start the loop', () => {
        state.gameState.set('paused');
        facade.togglePause();

        expect(state.gameState()).toBe('playing');
        expect(loop.resetTime).toHaveBeenCalledTimes(1);
        expect(loop.start).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if game is not in "playing" or "paused" state', () => {
        state.gameState.set('gameOver');
        facade.togglePause();
        expect(loop.stop).not.toHaveBeenCalled();
        expect(loop.start).not.toHaveBeenCalled();
    });
  });
});