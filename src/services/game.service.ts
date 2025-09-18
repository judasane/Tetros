/**
 * @fileoverview Manages the core game state and logic for Tetros.
 */
import { Injectable, computed, signal } from '@angular/core';
import { createEmptyBoard, applyGravityToColumn } from '../utils/board.utils';
import { isValidPosition, clearLines, calculateScore } from '../utils/game-logic.utils';
import { getRandomPiece, rotate } from '../utils/piece.utils';
import { Piece } from '../utils/piece.interface';
import { COLS, LEVEL_THRESHOLD, ROWS } from '../utils/constants';

/** Represents the possible states of the game. */
type GameState = 'start' | 'playing' | 'paused' | 'gameover' | 'countdown' | 'clearing';
/** Represents the types of available power-ups. */
type PowerUp = 'laser' | 'slow' | 'mutate' | 'aimer';
/** Represents the available animation styles for piece movement. */
type AnimationMode = 'step' | 'smooth';

/**
 * Service responsible for all game logic, state management, and player actions.
 */
@Injectable()
export class GameService {
  // --- Game State Signals ---
  /** The main game board, a 2D array of numbers representing cell states. */
  board = signal(createEmptyBoard());
  /** The currently falling piece controlled by the player. */
  currentPiece = signal<Piece | null>(null);
  /** The upcoming piece. */
  nextPiece = signal<Piece | null>(null);
  /** The piece currently in the hold slot. */
  holdPiece = signal<Piece | null>(null);
  /** The current state of the game finite state machine. */
  gameState = signal<GameState>('start');
  /** The player's current score. */
  score = signal(0);
  /** The current game level, which affects drop speed. */
  level = signal(1);
  /** The total number of lines cleared by the player. */
  linesCleared = signal(0);
  /** A flag to prevent holding a piece more than once per turn. */
  isHoldingAllowed = signal(true);
  /** The value for the pre-game countdown timer. */
  countdownValue = signal(0);
  
  // --- Animation Signals ---
  /** The selected animation style for piece movement. */
  animationMode = signal<AnimationMode>('smooth');
  /** The fractional progress (0-1) of the current piece's fall, used for smooth animation. */
  dropProgress = signal(0);
  
  // --- Power-Up Signals ---
  /** A map tracking the count of available power-ups. */
  powerUps = signal<{[key in PowerUp]: number}>({ laser: 1, slow: 1, mutate: 1, aimer: 1 });
  /** Flag indicating if the 'aimer' power-up is currently active. */
  isAiming = signal(false);
  /** The coordinates of the aimer's target on the board. */
  aimerPosition = signal({ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) });
  
  // --- Private State ---
  /** Timestamp of the last frame in the game loop. */
  private lastTime = 0;
  /** Accumulator for time elapsed since the last automatic drop. */
  private dropCounter = 0;
  /** Flag indicating if the 'slow' power-up is active. */
  private slowMotionActive = false;
  /** ID of the interval timer for the pre-game countdown. */
  private countdownIntervalId: any = null;

  // --- Keyboard Control State (DAS/ARR) ---
  /** Timer for Delayed Auto-Shift (DAS) delay. */
  private dasTimer: any = null;
  /** Timer for Auto-Repeat Rate (ARR) interval. */
  private arrTimer: any = null;
  /** Timer for soft drop auto-repeat. */
  private readonly dasDelay = 160; // ms
  private readonly arrInterval = 40;  // ms
  private softDropInterval: any = null;


  /**
   * A computed signal that calculates the position of the ghost piece.
   * The ghost piece shows where the current piece will land.
   */
  ghostPiece = computed(() => {
    const piece = this.currentPiece();
    if (!piece || this.gameState() !== 'playing') return null;

    let ghost = { ...piece, shape: piece.shape.map(row => [...row]) };
    while (isValidPosition(ghost, this.board())) {
      ghost.y++;
    }
    ghost.y--;
    return ghost;
  });

  /**
   * Checks if a specific power-up can be used.
   * @param powerUp The power-up to check.
   * @returns `true` if the power-up can be used, otherwise `false`.
   */
  canUsePowerUp(powerUp: PowerUp): boolean {
    return this.powerUps()[powerUp] > 0 && this.gameState() === 'playing' && !this.isAiming();
  }

  /**
   * Initializes or restarts the game, resetting all state variables and starting the countdown.
   */
  startGame(): void {
    if (this.countdownIntervalId) {
        clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = null;
    }
    // Clear any active movement timers from a previous game
    if (this.dasTimer) clearTimeout(this.dasTimer);
    if (this.arrTimer) clearInterval(this.arrTimer);
    if (this.softDropInterval) clearInterval(this.softDropInterval);
    this.dasTimer = null;
    this.arrTimer = null;
    this.softDropInterval = null;


    this.board.set(createEmptyBoard());
    this.currentPiece.set(getRandomPiece());
    this.nextPiece.set(getRandomPiece());
    this.holdPiece.set(null);
    this.score.set(0);
    this.level.set(1);
    this.linesCleared.set(0);
    this.isHoldingAllowed.set(true);
    this.powerUps.set({ laser: 1, slow: 1, mutate: 1, aimer: 1 });
    this.isAiming.set(false);
    this.aimerPosition.set({ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) });
    this.slowMotionActive = false;

    this.gameState.set('countdown');
    this.countdownValue.set(3);

    this.countdownIntervalId = setInterval(() => {
      this.countdownValue.update(v => v - 1);
      if (this.countdownValue() <= 0) {
        if(this.countdownIntervalId) clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = null;
        this.gameState.set('playing');
        this.lastTime = 0;
        this.dropCounter = 0;
        this.dropProgress.set(0);
        requestAnimationFrame((time) => this.gameLoop(time));
      }
    }, 1000);
  }

  /**
   * Toggles the game between 'playing' and 'paused' states.
   */
  togglePause(): void {
    if (this.gameState() === 'playing') {
      this.gameState.set('paused');
    } else if (this.gameState() === 'paused') {
      this.gameState.set('playing');
      this.lastTime = 0; // Reset time to avoid a sudden drop
      requestAnimationFrame((time) => this.gameLoop(time));
    }
  }

  /**
   * The main game loop, driven by `requestAnimationFrame`.
   * It calculates delta time to handle piece dropping and animations.
   * @param time The high-resolution timestamp provided by `requestAnimationFrame`.
   */
  private gameLoop(time: number): void {
    if (this.gameState() !== 'playing') return;

    if (this.lastTime === 0) {
      this.lastTime = time;
    }
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.dropCounter += deltaTime;
    
    const dropInterval = (1000 / this.level()) * (this.slowMotionActive ? 3 : 1);

    if (!this.softDropInterval) {
      while (this.dropCounter >= dropInterval) {
        this.moveDown();
        if (this.gameState() !== 'playing') {
          this.dropProgress.set(0);
          return; // Exit loop if game state changes (e.g., game over)
        }
        this.dropCounter -= dropInterval;
      }
    }

    if (this.currentPiece()) {
      // If the piece is resting on something, don't apply drop progress to prevent visual overshoot.
      if (this.canMoveDown()) {
        this.dropProgress.set(Math.min(1, this.dropCounter / dropInterval));
      } else {
        this.dropProgress.set(0);
      }
    } else {
      this.dropProgress.set(0);
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  /**
   * Moves the current piece one cell to the left, if possible.
   */
  moveLeft(): void {
    this.movePiece(-1, 0);
  }

  /**
   * Moves the current piece one cell to the right, if possible.
   */
  moveRight(): void {
    this.movePiece(1, 0);
  }
  
  /**
   * Moves the current piece one cell down (soft drop).
   */
  softDrop(): void {
    this.moveDown();
    this.dropCounter = 0; // Reset counter for immediate feedback
    this.dropProgress.set(0);
  }

  /**
   * Instantly drops the current piece to its final position and locks it.
   */
  hardDrop(): void {
    const piece = this.currentPiece();
    const ghost = this.ghostPiece();
    if (piece && ghost) {
      const droppedPiece = { ...piece, y: ghost.y };
      this.currentPiece.set(droppedPiece);
      this.lockPiece();
    }
  }

  /**
   * Rotates the current piece clockwise, applying wall kicks if necessary.
   */
  rotate(): void {
    const piece = this.currentPiece();
    if (!piece) return;

    const rotatedPiece = rotate(piece);

    // Try to find a valid position by "kicking" the piece.
    // This is a simplified wall kick, not full SRS.
    const kicks = [
      { x: 0, y: 0 },   // No kick
      { x: 1, y: 0 },   // Kick right 1
      { x: -1, y: 0 },  // Kick left 1
      { x: 2, y: 0 },   // Kick right 2 (for I piece)
      { x: -2, y: 0 },  // Kick left 2 (for I piece)
      { x: 0, y: -1 }   // Kick up 1
    ];

    for (const kick of kicks) {
      const kickedPiece = {
        ...rotatedPiece,
        x: rotatedPiece.x + kick.x,
        y: rotatedPiece.y + kick.y
      };

      if (isValidPosition(kickedPiece, this.board())) {
        this.currentPiece.set(kickedPiece);
        return; // Rotation successful
      }
    }
    // If no kick works, rotation fails.
  }

  /**
   * Swaps the current piece with the piece in the hold slot.
   */
  hold(): void {
    if (!this.isHoldingAllowed() || this.gameState() !== 'playing') return;
    const current = this.currentPiece();
    const held = this.holdPiece();

    this.holdPiece.set({...current!, x: 3, y: 0});
    if (held) {
        this.currentPiece.set({...held, x: 3, y: 0});
    } else {
        this.spawnNewPiece();
    }
    this.isHoldingAllowed.set(false);
  }

  /**
   * Checks if the current piece can move one cell down.
   * @returns `true` if the piece can move down, `false` otherwise.
   */
  private canMoveDown(): boolean {
    const piece = this.currentPiece();
    if (!piece) return false;
    const newPiece = { ...piece, y: piece.y + 1 };
    return isValidPosition(newPiece, this.board());
  }

  /**
   * Attempts to move the piece one step down. If it fails, the piece is locked.
   */
  private moveDown(): void {
    if (this.movePiece(0, 1)) {
        // Piece moved down successfully
    } else {
        this.lockPiece();
    }
  }
  
  /**
   * Attempts to move the current piece by a given delta.
   * @param dx The change in the x-coordinate.
   * @param dy The change in the y-coordinate.
   * @returns `true` if the move was successful, `false` otherwise.
   */
  private movePiece(dx: number, dy: number): boolean {
    const piece = this.currentPiece();
    if (!piece) return false;
    const newPiece = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (isValidPosition(newPiece, this.board())) {
      this.currentPiece.set(newPiece);
      return true;
    }
    return false;
  }

  /**
   * Locks the current piece onto the board, checks for line clears, and spawns the next piece.
   */
  private lockPiece(): void {
    const piece = this.currentPiece();
    if (!piece) return;

    const boardWithPiece = this.board().map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if(boardY >= 0) {
            boardWithPiece[boardY][boardX] = value;
          }
        }
      });
    });

    const linesToClear: number[] = [];
    boardWithPiece.forEach((row, y) => {
        if (row.every(cell => cell > 0)) {
            linesToClear.push(y);
        }
    });

    if (linesToClear.length > 0) {
        this.gameState.set('clearing');
        this.currentPiece.set(null);

        const animationBoard = boardWithPiece.map((row, y) => {
            if (linesToClear.includes(y)) {
                return Array(COLS).fill(-3); // -3 for clearing animation
            }
            return row;
        });
        this.board.set(animationBoard);

        setTimeout(() => {
            const { boardAfterClear, lines } = clearLines(boardWithPiece);
            this.board.set(boardAfterClear);

            if (lines > 0) {
                this.score.update(s => s + calculateScore(lines, this.level()));
                this.linesCleared.update(l => l + lines);
                this.level.set(Math.floor(this.linesCleared() / LEVEL_THRESHOLD) + 1);
                this.powerUps.update(p => ({ laser: p.laser+1, slow: p.slow+1, mutate: p.mutate+1, aimer: p.aimer+1 }));
            }

            this.spawnNewPiece();
            this.isHoldingAllowed.set(true);
            this.gameState.set('playing');
            this.lastTime = 0;
            requestAnimationFrame((time) => this.gameLoop(time));
        }, 300); // Animation duration
    } else {
        this.board.set(boardWithPiece);
        this.spawnNewPiece();
        this.isHoldingAllowed.set(true);
    }
  }

  /**
   * Spawns the next piece at the top of the board. Ends the game if the new piece is invalid.
   */
  private spawnNewPiece(): void {
    this.dropCounter = 0;
    this.dropProgress.set(0);
    this.currentPiece.set(this.nextPiece());
    this.nextPiece.set(getRandomPiece());

    if (!isValidPosition(this.currentPiece()!, this.board())) {
        this.gameState.set('gameover');
    }
  }
  
  /**
   * Activates a specified power-up if available.
   * @param powerUp The power-up to activate.
   */
  activatePowerUp(powerUp: PowerUp): void {
      if (!this.canUsePowerUp(powerUp)) return;
      
      this.powerUps.update(p => ({...p, [powerUp]: p[powerUp] - 1}));

      switch(powerUp) {
          case 'laser':
            const piece = this.currentPiece();
            if(!piece) return;
            const y = Math.min(ROWS - 1, piece.y + piece.shape.length);
            this.board.update(b => {
                const newBoard = b.map(row => [...row]);
                newBoard[y] = new Array(COLS).fill(0);
                return newBoard;
            });
            break;
          case 'slow':
            this.slowMotionActive = true;
            setTimeout(() => this.slowMotionActive = false, 5000);
            break;
          case 'mutate':
            this.currentPiece.set(getRandomPiece());
            this.nextPiece.set(getRandomPiece());
            break;
          case 'aimer':
            this.isAiming.set(true);
            this.gameState.set('paused'); // Pause game loop
            this.updateAimerBoard();
            break;
      }
  }

  /**
   * Handles keyboard input when the 'aimer' power-up is active.
   * @param key The key that was pressed (e.g., 'ArrowLeft', 'Enter').
   */
  handleAimerKeys(key: string): void {
    if (!this.isAiming()) return;

    this.aimerPosition.update(pos => {
      let { x, y } = pos;
      if (key === 'ArrowLeft') x = Math.max(0, x - 1);
      if (key === 'ArrowRight') x = Math.min(COLS - 1, x + 1);
      if (key === 'ArrowUp') y = Math.max(0, y - 1);
      if (key === 'ArrowDown') y = Math.min(ROWS - 1, y + 1);
      return { x, y };
    });
    this.updateAimerBoard();

    if (key === 'Enter') {
      this.executeAimer();
    }
  }

  /**
   * Updates the visual representation of the aimer's target on the board.
   */
  private updateAimerBoard(): void {
    const { x, y } = this.aimerPosition();
    this.board.update(b => {
      const newBoard = b.map(row => row.map(cell => cell === -2 ? 0 : cell));
      if (newBoard[y][x] !== -2) {
        newBoard[y][x] = -2;
      }
      return newBoard;
    });
  }

  /**
   * Executes the 'aimer' power-up, destroying the targeted cell and applying gravity.
   */
  private executeAimer(): void {
    this.isAiming.set(false);
    this.gameState.set('playing');
    const { x, y } = this.aimerPosition();

    this.board.update(b => {
      const newBoard = b.map(row => row.map(cell => cell === -2 ? 0 : cell));
      newBoard[y][x] = 0; // Destroy cell
      applyGravityToColumn(newBoard, x);
      return newBoard;
    });
    
    this.lastTime = 0;
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  /**
   * Toggles the animation mode between 'smooth' and 'step'.
   */
  toggleAnimationMode(): void {
    this.animationMode.update(current => current === 'smooth' ? 'step' : 'smooth');
  }

  /**
   * Handles the initial press of a key for movement, implementing DAS/ARR logic.
   * @param key The string identifier of the key that was pressed.
   */
  pressKey(key: string): void {
    switch (key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            if (this.dasTimer || this.arrTimer) return;
            const move = () => key === 'ArrowLeft' ? this.moveLeft() : this.moveRight();
            move();
            this.dasTimer = setTimeout(() => {
                this.arrTimer = setInterval(move, this.arrInterval);
            }, this.dasDelay);
            break;
        case 'ArrowDown':
            if (this.softDropInterval) return;
            this.softDrop();
            this.softDropInterval = setInterval(() => this.softDrop(), this.arrInterval);
            break;
        case 'ArrowUp':
            this.rotate();
            break;
        case ' ': // Spacebar
            this.hardDrop();
            break;
        case 'c':
        case 'C':
            this.hold();
            break;
        case '1':
            this.activatePowerUp('laser');
            break;
        case '2':
            this.activatePowerUp('slow');
            break;
        case '3':
            this.activatePowerUp('mutate');
            break;
        case '4':
            this.activatePowerUp('aimer');
            break;
    }
  }

  /**
   * Handles the release of a key, clearing any related movement timers (DAS/ARR).
   * @param key The string identifier of the key that was released.
   */
  releaseKey(key: string): void {
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
            break;
    }
  }
}