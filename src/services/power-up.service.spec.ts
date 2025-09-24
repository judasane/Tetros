import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PowerUpService } from './power-up.service';
import { GameStateService } from './game-state.service';
import { BoardService } from './board.service';
import { signal } from '@angular/core';

describe('PowerUpService', () => {
  let service: PowerUpService;
  let mockStateService: GameStateService;
  let mockBoardService: Partial<BoardService>;

  beforeEach(() => {
    mockStateService = {
      powerUps: signal({ laser: 1, slow: 1, mutate: 1, aimer: 1 }),
      gameState: signal('playing'),
      isAiming: signal(false),
      slowMotionActive: signal(false),
      currentPiece: signal(null),
      nextPiece: signal(null),
      aimerPosition: signal({ x: 0, y: 0 }),
      board: signal([])
    } as unknown as GameStateService;

    mockBoardService = {
      clearRow: vi.fn(),
      applyGravityToColumn: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PowerUpService,
        { provide: GameStateService, useValue: mockStateService },
        { provide: BoardService, useValue: mockBoardService },
      ],
    });
    service = TestBed.inject(PowerUpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('canUsePowerUp', () => {
    it('should return true if power-up is available and game is playing', () => {
      mockStateService.powerUps.set({ laser: 1, slow: 0, mutate: 0, aimer: 0 });
      mockStateService.gameState.set('playing');
      expect(service.canUsePowerUp('laser')).toBe(true);
    });

    it('should return false if no uses are available', () => {
      mockStateService.powerUps.set({ laser: 0, slow: 0, mutate: 0, aimer: 0 });
      mockStateService.gameState.set('playing');
      expect(service.canUsePowerUp('laser')).toBe(false);
    });

    it('should return false if game is not playing', () => {
      mockStateService.powerUps.set({ laser: 1, slow: 0, mutate: 0, aimer: 0 });
      mockStateService.gameState.set('paused');
      expect(service.canUsePowerUp('laser')).toBe(false);
    });
  });

  describe('activatePowerUp', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should activate laser and clear a row', () => {
      mockStateService.currentPiece.set({ x: 0, y: 10, shape: [[1]] });
      service.activatePowerUp('laser');
      expect(mockBoardService.clearRow).toHaveBeenCalledWith(11);
      expect(mockStateService.powerUps().laser).toBe(0);
    });

    it('should activate slow motion', () => {
      service.activatePowerUp('slow');
      expect(mockStateService.slowMotionActive()).toBe(true);
      vi.advanceTimersByTime(5000);
      expect(mockStateService.slowMotionActive()).toBe(false);
    });

    it('should activate mutate and change pieces', () => {
      const initialPiece = { x: 0, y: 0, shape: [[1]] };
      mockStateService.currentPiece.set(initialPiece);
      service.activatePowerUp('mutate');
      expect(mockStateService.currentPiece()).not.toBe(initialPiece);
    });

    it('should activate aimer and pause the game', () => {
        service.activatePowerUp('aimer');
        expect(mockStateService.isAiming()).toBe(true);
        expect(mockStateService.gameState()).toBe('paused');
    });
  });
});