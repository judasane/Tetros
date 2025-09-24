import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { GameLoopService } from './game-loop.service';
import { GameStateService } from './game-state.service';
import { GameActionsService } from './game-actions.service';
import { GameState } from '../utils/game-state.interface';

// Mock GameStateService
class MockGameStateService {
  level = signal(1);
  gameState = signal<GameState>('playing');
  softDropActive = signal(false);
  slowMotionActive = signal(false);
  currentPiece = signal<object | null>({});
  dropProgress = signal(0);
}

// Mock GameActionsService
class MockGameActionsService {
  tick = vi.fn();
  canMoveDown = vi.fn(() => true);
}

describe('GameLoopService', () => {
  let service: GameLoopService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameLoopService,
        { provide: GameStateService, useClass: MockGameStateService },
        { provide: GameActionsService, useClass: MockGameActionsService },
      ],
    });

    service = TestBed.inject(GameLoopService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('start() should call requestAnimationFrame', () => {
    const rAF = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(123);
    service.start();
    expect(rAF).toHaveBeenCalledTimes(1);
  });

  it('stop() should call cancelAnimationFrame if a frame is scheduled', () => {
    const rAF = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(123);
    const cAF = vi.spyOn(window, 'cancelAnimationFrame');

    service.start();
    service.stop();

    expect(cAF).toHaveBeenCalledWith(123);
  });

  it('stop() should not call cancelAnimationFrame if no frame is scheduled', () => {
    const cAF = vi.spyOn(window, 'cancelAnimationFrame');
    service.stop();
    expect(cAF).not.toHaveBeenCalled();
  });
});