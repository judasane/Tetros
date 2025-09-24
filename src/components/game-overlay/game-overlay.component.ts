/**
 * @fileoverview Component for displaying overlay screens like "Start", "Paused", and "Game Over".
 */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * A UI component that displays contextual overlays based on the current game state.
 * It provides buttons for the player to interact with the game state (e.g., start, pause, restart).
 */
@Component({
  selector: 'app-game-overlay',
  standalone: true,
  templateUrl: './game-overlay.component.html',
  styleUrls: ['./game-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverlayComponent {
  /** The current state of the game, which determines which overlay to show. */
  gameState = input.required<'start' | 'playing' | 'paused' | 'gameover' | 'countdown' | 'clearing'>();
  
  /** The remaining seconds for the start-of-game countdown. */
  countdownValue = input<number>(0);

  /** The current animation mode, displayed in the pause menu. */
  animationMode = input<'step' | 'smooth'>('smooth');

  /** The current volume for music. */
  musicVolume = input<number>(0.2);

  /** The current volume for sound effects. */
  sfxVolume = input<number>(0.5);

  /** Emits when the "Start Game" button is clicked. */
  start = output<void>();
  
  /** Emits when a "Restart" or "Play Again" button is clicked. */
  restart = output<void>();

  /** Emits when the "Resume" button is clicked. */
  togglePause = output<void>();

  /** Emits when the animation mode toggle button is clicked. */
  toggleAnimation = output<void>();

  /** Emits when the music volume slider is changed. */
  musicVolumeChange = output<Event>();

  /** Emits when the sound effects volume slider is changed. */
  sfxVolumeChange = output<Event>();
}
