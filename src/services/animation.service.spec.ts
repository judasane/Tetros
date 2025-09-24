import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

import { AnimationService } from './animation.service';
import { GameStateService } from './game-state.service';
import { Piece } from '../utils/piece.interface';
import { createEmptyBoard } from '../utils/board.utils';
import { GameState } from '../utils/game-state.interface';

// Mock GameStateService
class MockGameStateService {
  currentPiece = signal<Piece | null>(null);
  board = signal<number[][]>(createEmptyBoard());
  gameState = signal<GameState>('playing');
  animationMode = signal<'smooth' | 'step'>('smooth');

  // Helper methods to update signals in tests
  setCurrentPiece(piece: Piece | null) {
    this.currentPiece.set(piece);
  }
  setBoard(board: number[][]) {
    this.board.set(board);
  }
  setGameState(state: GameState) {
    this.gameState.set(state);
  }
}

describe('AnimationService', () => {
  let service: AnimationService;
  let gameStateService: MockGameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnimationService,
        { provide: GameStateService, useClass: MockGameStateService },
      ],
    });

    service = TestBed.inject(AnimationService);
    gameStateService = TestBed.inject(GameStateService) as unknown as MockGameStateService;
  });

  describe('ghostPiece', () => {
    const testPiece: Piece = { x: 4, y: 0, shape: [[1, 1], [1, 1]] }; // O piece

    it('should be null if there is no current piece', () => {
      gameStateService.setCurrentPiece(null);
      expect(service.ghostPiece()).toBeNull();
    });

    it('should be null if game is not in "playing" state', () => {
        gameStateService.setCurrentPiece(testPiece);
        gameStateService.setGameState('paused');
        expect(service.ghostPiece()).toBeNull();
        gameStateService.setGameState('gameOver');
        expect(service.ghostPiece()).toBeNull();
      });

    it('should calculate the correct landing position on an empty board', () => {
      gameStateService.setBoard(createEmptyBoard());
      gameStateService.setCurrentPiece({ ...testPiece, y: 0 }); // Piece at the top

      const ghost = service.ghostPiece();
      expect(ghost).not.toBeNull();
      // On an empty 20-row board, an O piece (2 rows high) should land on y=18
      expect(ghost?.y).toBe(18);
    });

    it('should calculate the correct landing position on a board with obstacles', () => {
      const board = createEmptyBoard();
      // Place an obstacle at y=15
      board[15][4] = 9;
      board[15][5] = 9;
      gameStateService.setBoard(board);
      gameStateService.setCurrentPiece({ ...testPiece, y: 0 });

      const ghost = service.ghostPiece();
      expect(ghost).not.toBeNull();
      // The piece is 2 rows high, obstacle at y=15. It should land right on top of it.
      // The bottom of the piece (y + height) will be at 15.
      // So, ghost.y + 2 = 15 -> ghost.y = 13
      expect(ghost?.y).toBe(13);
    });

    it('should have the same x position and shape as the current piece', () => {
        gameStateService.setBoard(createEmptyBoard());
        gameStateService.setCurrentPiece(testPiece);

        const ghost = service.ghostPiece();
        expect(ghost).not.toBeNull();
        expect(ghost?.x).toBe(testPiece.x);
        expect(ghost?.shape).toEqual(testPiece.shape);
      });
  });

  describe('toggleAnimationMode', () => {
    it('should toggle animationMode from "smooth" to "step"', () => {
      expect(gameStateService.animationMode()).toBe('smooth');
      service.toggleAnimationMode();
      expect(gameStateService.animationMode()).toBe('step');
    });

    it('should toggle animationMode from "step" to "smooth"', () => {
      gameStateService.animationMode.set('step');
      expect(gameStateService.animationMode()).toBe('step');
      service.toggleAnimationMode();
      expect(gameStateService.animationMode()).toBe('smooth');
    });
  });
});