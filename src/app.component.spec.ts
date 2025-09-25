import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AppComponent } from './app.component';
import { GameFacade } from './services/game.facade';
import { GameState } from './utils/game-state.interface';

import { createEmptyBoard } from './utils/board.utils';

// Mock GameFacade
class MockGameFacade {
  // Methods to be spied on
  rotate = vi.fn();
  moveLeft = vi.fn();
  moveRight = vi.fn();
  hardDrop = vi.fn();
  softDrop = vi.fn();
  startGame = vi.fn();
  togglePause = vi.fn();
  toggleAnimationMode = vi.fn();
  activatePowerUp = vi.fn();
  canUsePowerUp = vi.fn(() => true);

  // Signals needed by the template
  board = signal(createEmptyBoard());
  currentPiece = signal(null);
  ghostPiece = signal(null);
  animationMode = signal<'smooth' | 'step'>('smooth');
  dropProgress = signal(0);
  gameState = signal<GameState>('playing');
  countdownValue = signal(0);
  holdPiece = signal(null);
  nextPiece = signal(null);
  score = signal(0);
  level = signal(1);
  linesCleared = signal(0);
}

// Helper to create a TouchEvent in JSDOM where `Touch` is not defined
const createTouchEvent = (type: 'touchstart' | 'touchmove' | 'touchend', x: number, y: number): TouchEvent => {
    const touchPoint = { clientX: x, clientY: y };
    // We need to use a real TouchEvent for the instance check in the component to work
    const event = new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
    });
    // JSDOM doesn't fully implement TouchEvent properties
    Object.defineProperty(event, 'touches', { value: [touchPoint], configurable: true });
    Object.defineProperty(event, 'changedTouches', { value: [touchPoint], configurable: true });
    return event;
};


describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let facade: MockGameFacade; // Use the mock class directly for type safety
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: GameFacade, useClass: MockGameFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    facade = TestBed.inject(GameFacade) as MockGameFacade;
    element = fixture.nativeElement; // Events are now on the host element
    fixture.detectChanges();
  });

  describe('Touch Gestures', () => {
    beforeEach(() => {
      // Set a fixed cell size for predictable thresholds
      component.cellSize.set(20);
      vi.useFakeTimers();
      // Reset mocks before each test
      vi.clearAllMocks();
      // Set game state to playing for handlers to execute
      facade.gameState.set('playing');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should call game.rotate() on a tap', () => {
      component.handleTouchStart(createTouchEvent('touchstart', 100, 100));
      vi.advanceTimersByTime(50); // Short time delta
      component.handleTouchEnd(createTouchEvent('touchend', 105, 105)); // Small position delta

      expect(facade.rotate).toHaveBeenCalledTimes(1);
    });

    it('should call game.moveRight() on a right swipe', () => {
      component.handleTouchStart(createTouchEvent('touchstart', 100, 100));
      // Move needs to be > 80% of cell size (0.8 * 20 = 16)
      component.handleTouchMove(createTouchEvent('touchmove', 117, 101));

      expect(facade.moveRight).toHaveBeenCalledTimes(1);
      expect(facade.moveLeft).not.toHaveBeenCalled();
    });

    it('should call game.moveLeft() on a left swipe', () => {
      component.handleTouchStart(createTouchEvent('touchstart', 100, 100));
      component.handleTouchMove(createTouchEvent('touchmove', 83, 101));

      expect(facade.moveLeft).toHaveBeenCalledTimes(1);
      expect(facade.moveRight).not.toHaveBeenCalled();
    });

    it('should call game.hardDrop() on a fast downward swipe', () => {
      component.handleTouchStart(createTouchEvent('touchstart', 100, 100));
      vi.advanceTimersByTime(100); // Fast swipe
      // Long downward swipe (threshold is 30 * 2.5 = 75)
      component.handleTouchEnd(createTouchEvent('touchend', 105, 180));

      expect(facade.hardDrop).toHaveBeenCalledTimes(1);
    });

    it('should call game.softDrop() on a downward move', () => {
      component.handleTouchStart(createTouchEvent('touchstart', 100, 100));
      // Move > 16px down
      component.handleTouchMove(createTouchEvent('touchmove', 101, 117));

      expect(facade.softDrop).toHaveBeenCalledTimes(1);
    });

    it('should NOT call rotate() on a long press (tap time exceeded)', () => {
      component.handleTouchStart(createTouchEvent('touchstart', 100, 100));
      vi.advanceTimersByTime(300); // Exceeds tap time threshold
      component.handleTouchEnd(createTouchEvent('touchend', 105, 105));

      expect(facade.rotate).not.toHaveBeenCalled();
    });

    it('should not process gestures if game state is not "playing"', () => {
        facade.gameState.set('paused'); // or 'start', 'gameOver', etc.

        component.handleTouchStart(createTouchEvent('touchstart', 100, 100));
        component.handleTouchMove(createTouchEvent('touchmove', 120, 100));
        component.handleTouchEnd(createTouchEvent('touchend', 120, 100));

        expect(facade.moveRight).not.toHaveBeenCalled();
        expect(facade.rotate).not.toHaveBeenCalled();
    });
  });
});