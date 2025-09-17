/**
 * @fileoverview Root component for the TetroBomber application.
 */
import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { BoardComponent } from './components/board/board.component';
import { GameOverlayComponent } from './components/game-overlay/game-overlay.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { PiecePreviewComponent } from './components/piece-preview/piece-preview.component';
import { COLS, ROWS } from './utils/constants';

/**
 * The main application component.
 * It assembles the game's UI components and handles global keyboard and touch events for game control.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    BoardComponent,
    GameOverlayComponent,
    InfoPanelComponent,
    PiecePreviewComponent,
  ],
  providers: [GameService],
  host: {
    '(window:keydown)': 'handleKeyDown($event)',
    '(window:keyup)': 'handleKeyUp($event)',
    '(window:resize)': 'updateCellSize()'
  }
})
export class AppComponent implements OnInit {
  /** Injected instance of the GameService, which manages all game state and logic. */
  game = inject(GameService);

  /** The dynamically calculated size of a single board cell in pixels. */
  cellSize = signal(32);

  // --- Touch Gesture State ---
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private lastMoveX = 0;
  private lastMoveY = 0;
  private readonly swipeThreshold = 30; // Min pixels for a swipe
  private readonly tapThreshold = 20;   // Max pixels for a tap
  private readonly tapTimeThreshold = 200; // Max ms for a tap
  private readonly hardDropTimeThreshold = 250; // Max ms for a hard drop swipe
  
  /**
   * Initializes the component and performs the initial cell size calculation.
   */
  ngOnInit(): void {
    this.updateCellSize();
  }
  
  /**
   * Calculates and updates the optimal cell size based on the window's dimensions.
   */
  updateCellSize(): void {
    const isMobile = window.innerWidth < 768; // md breakpoint in Tailwind
    
    // On mobile, leave space for top/bottom panels
    // On desktop, leave space for side panels
    const availableHeight = isMobile ? window.innerHeight * 0.6 : window.innerHeight * 0.85;
    const availableWidth = isMobile ? window.innerWidth * 0.95 : window.innerWidth * 0.4;
    
    const sizeByHeight = availableHeight / ROWS;
    const sizeByWidth = availableWidth / COLS;
    
    this.cellSize.set(Math.floor(Math.min(sizeByHeight, sizeByWidth)));
  }

  /**
   * Handles the global 'keydown' event to process player inputs.
   * @param event The KeyboardEvent triggered by the key press.
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (event.repeat) return;
    if (this.game.gameState() === 'gameover' || this.game.isAiming()) {
      if (this.game.isAiming()) this.game.handleAimerKeys(event.key);
      return;
    }
    if (this.game.gameState() === 'start' && event.key === 'Enter') {
      this.game.startGame();
      return;
    }
    if (this.game.gameState() === 'countdown' || this.game.gameState() === 'clearing') return;
    if (event.key === 'p' || event.key === 'P') {
      this.game.togglePause();
      return;
    }
    if (this.game.gameState() === 'paused') return;
    this.game.pressKey(event.key);
  }

  /**
   * Handles the global 'keyup' event to stop continuous actions.
   * @param event The KeyboardEvent triggered by the key release.
   */
  handleKeyUp(event: KeyboardEvent): void {
    this.game.releaseKey(event.key);
  }

  /**
   * Records the starting coordinates of a touch event.
   * @param event The TouchEvent.
   */
  handleTouchStart(event: TouchEvent): void {
    if (this.game.gameState() !== 'playing') return;
    event.preventDefault();
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.touchStartTime = Date.now();
    this.lastMoveX = this.touchStartX;
    this.lastMoveY = this.touchStartY;
  }

  /**
   * Processes touch movement to detect and handle swipes.
   * @param event The TouchEvent.
   */
  handleTouchMove(event: TouchEvent): void {
    if (this.game.gameState() !== 'playing') return;
    event.preventDefault();
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    const deltaX = touchX - this.lastMoveX;
    const deltaY = touchY - this.lastMoveY;
    
    const horizontalMoveThreshold = this.cellSize() * 0.8;
    const verticalMoveThreshold = this.cellSize() * 0.8;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > horizontalMoveThreshold) {
      if (deltaX > 0) this.game.moveRight();
      else this.game.moveLeft();
      this.lastMoveX = touchX;
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > verticalMoveThreshold) {
      this.game.softDrop();
      this.lastMoveY = touchY;
    }
  }

  /**
   * Processes the end of a touch to detect taps and hard drops.
   * @param event The TouchEvent.
   */
  handleTouchEnd(event: TouchEvent): void {
    if (this.game.gameState() !== 'playing') return;
    event.preventDefault();
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    const elapsedTime = Date.now() - this.touchStartTime;

    // Check for Tap (Rotate)
    if (Math.abs(deltaX) < this.tapThreshold && Math.abs(deltaY) < this.tapThreshold && elapsedTime < this.tapTimeThreshold) {
      this.game.rotate();
      return;
    }

    // Check for Hard Drop (fast, long downward swipe)
    if (deltaY > this.swipeThreshold * 2.5 && deltaY > Math.abs(deltaX) && elapsedTime < this.hardDropTimeThreshold) {
      this.game.hardDrop();
      return;
    }
  }
}
