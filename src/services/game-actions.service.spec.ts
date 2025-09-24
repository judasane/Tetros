import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameActionsService } from './game-actions.service';
import { GameStateService } from './game-state.service';
import { BoardService } from './board.service';
import { AnimationService } from './animation.service';
import { Piece } from '../utils/piece.interface';
import { createEmptyBoard } from '../utils/board.utils';
import * as gameLogicUtils from '../utils/game-logic.utils';
import { signal } from '@angular/core';

vi.mock('../utils/game-logic.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof gameLogicUtils>();
  return {
    ...actual, // Keep other functions from the module
    isValidPosition: vi.fn(), // Mock isValidPosition specifically
  };
});

describe('GameActionsService', () => {
  let actionsService: GameActionsService;
  let mockStateService: GameStateService;
  let mockBoardService: Partial<BoardService>;
  let mockAnimationService: {
    ghostPiece: ReturnType<typeof signal<Piece | null>>;
  };

  // Mock signals for state
  const mockCurrentPiece = signal<Piece | null>(null);
  const mockBoard = signal(createEmptyBoard());
  const mockGhostPieceSignal = signal<Piece | null>(null);
  const mockDropProgress = signal(0);
  const mockHoldPiece = signal<Piece | null>(null);
  const mockIsHoldingAllowed = signal(true);
  const mockGameState = signal<'playing' | 'paused' | 'gameover' | 'clearing'>('playing');
  const mockNextPiece = signal<Piece | null>(null);
  const mockScore = signal(0);
  const mockLinesCleared = signal(0);
  const mockLevel = signal(1);
  const mockPowerUps = signal({ laser: 0, slow: 0, mutate: 0, aimer: 0 });


  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(gameLogicUtils.isValidPosition).mockClear();

    // Define mock implementations for the services
    mockStateService = {
      currentPiece: mockCurrentPiece,
      board: mockBoard,
      dropProgress: mockDropProgress,
      holdPiece: mockHoldPiece,
      isHoldingAllowed: mockIsHoldingAllowed,
      gameState: mockGameState,
      nextPiece: mockNextPiece,
      score: mockScore,
      linesCleared: mockLinesCleared,
      level: mockLevel,
      powerUps: mockPowerUps,
      // Add any other properties from GameStateService that are used
    } as GameStateService;

    mockBoardService = {
      getBoardWithPiece: vi.fn(),
      clearCompletedLines: vi.fn(),
    };

    mockAnimationService = {
      ghostPiece: mockGhostPieceSignal,
    };

    // Configure the test bed
    TestBed.configureTestingModule({
      providers: [
        GameActionsService,
        { provide: GameStateService, useValue: mockStateService },
        { provide: BoardService, useValue: mockBoardService },
        { provide: AnimationService, useValue: mockAnimationService },
      ],
    });

    // Get the service instance from the TestBed injector
    actionsService = TestBed.inject(GameActionsService);

    // Reset signals before each test
    mockCurrentPiece.set(null);
    mockBoard.set(createEmptyBoard());
    mockGhostPieceSignal.set(null);
  });

  it('should rotate the current piece successfully if the rotation is valid', () => {
    // 1. Arrange
    // For this test, we need isValidPosition to return true
    vi.mocked(gameLogicUtils.isValidPosition).mockReturnValue(true);

    const initialPiece: Piece = {
      x: 3,
      y: 4,
      shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T-shape
    };
    // Set the initial state in our mock service
    mockCurrentPiece.set(initialPiece);
    mockBoard.set(createEmptyBoard());

    // This is the correct clockwise rotation of the T-piece
    const rotatedShape = [[0, 1, 0], [0, 1, 1], [0, 1, 0]];

    // 2. Act
    actionsService.rotate();

    // 3. Assert
    const finalPiece = mockCurrentPiece();
    expect(finalPiece).not.toBeNull();
    expect(finalPiece!.shape).toEqual(rotatedShape);
    // Position should be the same as no wall kick was needed
    expect(finalPiece!.x).toBe(3);
    expect(finalPiece!.y).toBe(4);
  });

  it('should not rotate the piece if isValidPosition always returns false', () => {
    // 1. Arrange
    const initialPiece: Piece = {
      x: 1,
      y: 1,
      shape: [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T-piece
    };
    mockCurrentPiece.set(initialPiece);
    mockBoard.set(createEmptyBoard());

    // Force isValidPosition to always return false
    vi.mocked(gameLogicUtils.isValidPosition).mockReturnValue(false);

    // 2. Act
    actionsService.rotate();

    // 3. Assert
    const finalPiece = mockCurrentPiece();
    // The piece should not have changed because no valid rotation was found
    expect(finalPiece!.shape).toEqual(initialPiece.shape);
    expect(finalPiece!.x).toBe(initialPiece.x);
    // Ensure the mock was actually called
    expect(gameLogicUtils.isValidPosition).toHaveBeenCalled();
  });

  describe('moveLeft() / moveRight()', () => {
    const initialPiece: Piece = {
      x: 3,
      y: 4,
      shape: [[1, 1], [1, 1]], // O-piece
    };

    beforeEach(() => {
      mockCurrentPiece.set({ ...initialPiece });
    });

    it('should move the piece left if the position is valid', () => {
      vi.mocked(gameLogicUtils.isValidPosition).mockReturnValue(true);
      actionsService.moveLeft();
      expect(mockCurrentPiece()?.x).toBe(initialPiece.x - 1);
    });

    it('should move the piece right if the position is valid', () => {
      vi.mocked(gameLogicUtils.isValidPosition).mockReturnValue(true);
      actionsService.moveRight();
      expect(mockCurrentPiece()?.x).toBe(initialPiece.x + 1);
    });

    it('should not move left if there is a wall', () => {
      // Mock returns false if piece moves left
      vi.mocked(gameLogicUtils.isValidPosition).mockImplementation((piece) => {
        return piece.x !== initialPiece.x - 1;
      });
      actionsService.moveLeft();
      expect(mockCurrentPiece()?.x).toBe(initialPiece.x);
    });

    it('should not move right if there is another piece blocking', () => {
      // Mock returns false if piece moves right
      vi.mocked(gameLogicUtils.isValidPosition).mockImplementation((piece) => {
        return piece.x !== initialPiece.x + 1;
      });
      actionsService.moveRight();
      expect(mockCurrentPiece()?.x).toBe(initialPiece.x);
    });
  });

  describe('hardDrop()', () => {
    const initialPiece: Piece = { x: 3, y: 4, shape: [[1]] };
    const ghostPiece: Piece = { x: 3, y: 18, shape: [[1]] };

    beforeEach(() => {
      mockCurrentPiece.set({ ...initialPiece });
      mockAnimationService.ghostPiece.set({ ...ghostPiece });
    });

    it('should move the current piece to the ghost piece position', () => {
      // Spy on lockPiece but do nothing
      vi.spyOn(actionsService as any, 'lockPiece').mockImplementation(() => {});

      actionsService.hardDrop();

      const finalPiece = mockCurrentPiece();
      expect(finalPiece?.y).toBe(ghostPiece.y);
      expect(finalPiece?.x).toBe(ghostPiece.x); // x should remain the same
    });

    it('should call lockPiece after dropping', () => {
      const lockPieceSpy = vi.spyOn(actionsService as any, 'lockPiece').mockImplementation(() => {});

      actionsService.hardDrop();

      expect(lockPieceSpy).toHaveBeenCalledOnce();
    });

    it('should do nothing if there is no piece', () => {
      const lockPieceSpy = vi.spyOn(actionsService as any, 'lockPiece').mockImplementation(() => {});
      mockCurrentPiece.set(null);

      actionsService.hardDrop();

      expect(lockPieceSpy).not.toHaveBeenCalled();
    });
  });

  describe('softDrop()', () => {
    const initialPiece: Piece = { x: 3, y: 4, shape: [[1]] };

    beforeEach(() => {
      mockCurrentPiece.set({ ...initialPiece });
      mockStateService.dropProgress.set(50); // Set some initial progress
    });

    it('should move the piece down one unit if valid', () => {
      vi.mocked(gameLogicUtils.isValidPosition).mockReturnValue(true);
      actionsService.softDrop();
      expect(mockCurrentPiece()?.y).toBe(initialPiece.y + 1);
    });

    it('should reset dropProgress', () => {
      vi.mocked(gameLogicUtils.isValidPosition).mockReturnValue(true);
      actionsService.softDrop();
      expect(mockStateService.dropProgress()).toBe(0);
    });

    it('should call lockPiece if move is not valid', () => {
      vi.mocked(gameLogicUtils.isValidPosition).mockReturnValue(false);
      const lockPieceSpy = vi.spyOn(actionsService as any, 'lockPiece').mockImplementation(() => {});

      actionsService.softDrop();

      expect(lockPieceSpy).toHaveBeenCalledOnce();
    });
  });

  describe('hold()', () => {
    const initialPiece: Piece = { x: 5, y: 5, shape: [[1]] }; // A simple piece
    const heldPiece: Piece = { x: 0, y: 0, shape: [[2]] }; // A different piece

    beforeEach(() => {
      mockCurrentPiece.set({ ...initialPiece });
      mockHoldPiece.set(null);
      mockIsHoldingAllowed.set(true);
      mockGameState.set('playing');
      vi.spyOn(actionsService as any, 'spawnNewPiece').mockImplementation(() => {});
    });

    it('should move the current piece to hold and spawn a new piece if hold is empty', () => {
      actionsService.hold();

      expect(mockHoldPiece()?.shape).toEqual(initialPiece.shape);
      expect((actionsService as any).spawnNewPiece).toHaveBeenCalledOnce();
      expect(mockIsHoldingAllowed()).toBe(false);
    });

    it('should swap the current piece with the held piece', () => {
      mockHoldPiece.set({ ...heldPiece });
      actionsService.hold();

      expect(mockHoldPiece()?.shape).toEqual(initialPiece.shape);
      expect(mockCurrentPiece()?.shape).toEqual(heldPiece.shape);
      expect(mockIsHoldingAllowed()).toBe(false);
    });

    it('should not do anything if holding is not allowed', () => {
      mockIsHoldingAllowed.set(false);
      actionsService.hold();

      expect(mockHoldPiece()).toBeNull();
      expect(mockCurrentPiece()?.shape).toEqual(initialPiece.shape);
    });

    it('should not do anything if game state is not "playing"', () => {
      mockGameState.set('paused');
      actionsService.hold();

      expect(mockHoldPiece()).toBeNull();
      expect(mockCurrentPiece()?.shape).toEqual(initialPiece.shape);
    });
  });

  describe('lockPiece()', () => {
    const initialPiece: Piece = { x: 0, y: 0, shape: [[1]] };
    const boardWithPiece = createEmptyBoard();

    beforeEach(() => {
      vi.useFakeTimers();
      mockCurrentPiece.set(initialPiece);
      vi.mocked(mockBoardService.getBoardWithPiece).mockReturnValue(boardWithPiece);
      // Reset state signals that might be affected
      mockGameState.set('playing');
      mockScore.set(0);
      mockLinesCleared.set(0);
      mockPowerUps.set({ laser: 0, slow: 0, mutate: 0, aimer: 0 });
    });

    it('should update score and lines when clearing lines', () => {
      const spawnNewPieceSpy = vi.spyOn(actionsService as any, 'spawnNewPiece').mockImplementation(() => {});
      const boardWithFullLine = createEmptyBoard();
      boardWithFullLine[19] = Array(10).fill(1);
      vi.mocked(mockBoardService.getBoardWithPiece).mockReturnValue(boardWithFullLine);
      vi.mocked(mockBoardService.clearCompletedLines).mockReturnValue({ boardAfterClear: createEmptyBoard(), linesCleared: 1 });
      vi.spyOn(gameLogicUtils, 'calculateScore').mockReturnValue(100);

      (actionsService as any).lockPiece();
      vi.runAllTimers();

      expect(mockStateService.score()).toBe(100);
      expect(mockStateService.linesCleared()).toBe(1);
      expect(mockStateService.powerUps().laser).toBe(1);
      expect(spawnNewPieceSpy).toHaveBeenCalledOnce();
    });

    it('should set gameState to "gameover" if new piece is invalid', () => {
      // Spy on the private method. By default, it calls the original implementation.
      const spawnNewPieceSpy = vi.spyOn(actionsService as any, 'spawnNewPiece');

      // When spawnNewPiece is called, we want isValidPosition to fail
      vi.mocked(gameLogicUtils.isValidPosition).mockReturnValue(false);

      // Ensure we don't enter the line clearing logic for this test
      vi.mocked(mockBoardService.getBoardWithPiece).mockReturnValue(createEmptyBoard());

      // Act
      (actionsService as any).lockPiece();

      // Assert
      expect(spawnNewPieceSpy).toHaveBeenCalledOnce();
      expect(mockStateService.gameState()).toBe('gameover');
    });
  });
});
