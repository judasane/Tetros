import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { InputService } from './input.service';
import { GameStateService } from './game-state.service';
import { GameActionsService } from './game-actions.service';
import { PowerUpService } from './power-up.service';
import { DAS_DELAY, ARR_INTERVAL } from '../utils/constants';
import { GameState } from '../utils/game-state.interface';

// Mocks
class MockGameStateService {
  isAiming = signal(false);
  gameState = signal<GameState>('playing');
  softDropActive = signal(false);
}
class MockGameActionsService {
  moveLeft = vi.fn();
  moveRight = vi.fn();
  softDrop = vi.fn();
  rotate = vi.fn();
  hardDrop = vi.fn();
  hold = vi.fn();
}
class MockPowerUpService {
    handleAimerKeys = vi.fn();
    activatePowerUp = vi.fn();
}

describe('InputService', () => {
  let service: InputService;
  let actions: MockGameActionsService;
  let state: MockGameStateService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        InputService,
        { provide: GameStateService, useClass: MockGameStateService },
        { provide: GameActionsService, useClass: MockGameActionsService },
        { provide: PowerUpService, useClass: MockPowerUpService },
      ],
    });
    service = TestBed.inject(InputService);
    actions = TestBed.inject(GameActionsService) as any;
    state = TestBed.inject(GameStateService) as any;
  });

  afterEach(() => {
    service.clearTimers();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Horizontal Movement (DAS/ARR)', () => {
    it('should handle the full press-hold-release lifecycle for ArrowLeft', async () => {
      // 1. Initial Press
      service.press('ArrowLeft');
      expect(actions.moveLeft).toHaveBeenCalledTimes(1);

      // 2. Advance time just before DAS delay expires
      await vi.advanceTimersByTimeAsync(DAS_DELAY - 1);
      expect(actions.moveLeft).toHaveBeenCalledTimes(1);

      // 3. Advance time to trigger DAS. This only sets up the interval.
      await vi.advanceTimersByTimeAsync(1);
      expect(actions.moveLeft).toHaveBeenCalledTimes(1); // No new call yet

      // 4. Advance time for the first ARR trigger
      await vi.advanceTimersByTimeAsync(ARR_INTERVAL);
      expect(actions.moveLeft).toHaveBeenCalledTimes(2);

      // 5. Advance time for three more ARR triggers
      await vi.advanceTimersByTimeAsync(ARR_INTERVAL * 3);
      expect(actions.moveLeft).toHaveBeenCalledTimes(2 + 3);

      // 6. Release the key
      service.release('ArrowLeft');
      await vi.advanceTimersByTimeAsync(ARR_INTERVAL * 5); // Advance time far into the future
      expect(actions.moveLeft).toHaveBeenCalledTimes(5); // No more calls
    });
  });

  describe('Soft Drop', () => {
    it('should call softDrop repeatedly on ArrowDown press and stop on release', async () => {
      // 1. Initial press
      service.press('ArrowDown');
      expect(actions.softDrop).toHaveBeenCalledTimes(1);
      expect(state.softDropActive()).toBe(true);

      // 2. Advance time to trigger soft drop repeat
      await vi.advanceTimersByTimeAsync(ARR_INTERVAL);
      expect(actions.softDrop).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(ARR_INTERVAL);
      expect(actions.softDrop).toHaveBeenCalledTimes(3);

      // 3. Release key
      service.release('ArrowDown');
      expect(state.softDropActive()).toBe(false);

      // 4. Advance time again, no more calls should be made
      await vi.advanceTimersByTimeAsync(ARR_INTERVAL * 2);
      expect(actions.softDrop).toHaveBeenCalledTimes(3);
    });
  });

  describe('Other inputs', () => {
    it('should call rotate on ArrowUp', () => {
        service.press('ArrowUp');
        expect(actions.rotate).toHaveBeenCalledTimes(1);
    });

    it('should call hardDrop on Space', () => {
        service.press(' ');
        expect(actions.hardDrop).toHaveBeenCalledTimes(1);
    });

    it('should call hold on "c"', () => {
        service.press('c');
        expect(actions.hold).toHaveBeenCalledTimes(1);
    });

    it('should not process inputs if game state is not "playing"', () => {
        state.gameState = signal('paused');
        service.press('ArrowLeft');
        service.press('ArrowDown');
        expect(actions.moveLeft).not.toHaveBeenCalled();
        expect(actions.softDrop).not.toHaveBeenCalled();
    });
  });
});