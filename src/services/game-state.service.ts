import { Injectable, signal } from '@angular/core';
import { createEmptyBoard } from '../utils/board.utils';
import { Piece } from '../utils/piece.interface';
import { COLS, ROWS } from '../utils/constants';

// Type Definitions
export type GameState = 'start' | 'playing' | 'paused' | 'gameover' | 'countdown' | 'clearing';
export type PowerUp = 'laser' | 'slow' | 'mutate' | 'aimer';
export type AnimationMode = 'step' | 'smooth';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  // --- Game State Signals ---
  board = signal(createEmptyBoard());
  currentPiece = signal<Piece | null>(null);
  nextPiece = signal<Piece | null>(null);
  holdPiece = signal<Piece | null>(null);
  gameState = signal<GameState>('start');
  score = signal(0);
  level = signal(1);
  linesCleared = signal(0);
  isHoldingAllowed = signal(true);
  /** Flag to indicate if the user is actively holding the soft drop key. */
  softDropActive = signal(false);
  countdownValue = signal(0);

  // --- Animation Signals ---
  animationMode = signal<AnimationMode>('smooth');
  dropProgress = signal(0);

  // --- Power-Up Signals ---
  powerUps = signal<{[key in PowerUp]: number}>({ laser: 1, slow: 1, mutate: 1, aimer: 1 });
  isAiming = signal(false);
  aimerPosition = signal({ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) });
  slowMotionActive = signal(false);

  constructor() { }
}
