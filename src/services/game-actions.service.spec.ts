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
  let mockAnimationService: Partial<AnimationService>;

  // Mock signals for state
  const mockCurrentPiece = signal<Piece | null>(null);
  const mockBoard = signal(createEmptyBoard());

  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(gameLogicUtils.isValidPosition).mockClear();

    // Define mock implementations for the services
    mockStateService = {
      currentPiece: mockCurrentPiece,
      board: mockBoard,
      // Add any other properties from GameStateService that are used
    } as GameStateService;

    mockBoardService = {
      // Mock methods used by GameActionsService if any
    };

    mockAnimationService = {
      // Mock methods used by GameStateService if any
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
});
