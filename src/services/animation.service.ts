import { Injectable, computed, inject } from '@angular/core';
import { GameStateService } from './game-state.service';
import { isValidPosition } from '../utils/game-logic.utils';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private state = inject(GameStateService);

  /**
   * A computed signal that calculates the position of the ghost piece.
   * The ghost piece shows where the current piece will land.
   */
  ghostPiece = computed(() => {
    const piece = this.state.currentPiece();
    const board = this.state.board();

    // Do not show ghost piece if game is not in a playable state.
    if (!piece || this.state.gameState() !== 'playing') {
      return null;
    }

    // Create a copy of the piece to mutate.
    let ghost = { ...piece, shape: piece.shape.map(row => [...row]) };

    // Drop the ghost piece down until it hits something.
    while (isValidPosition(ghost, board)) {
      ghost.y++;
    }

    // Move it back up one step to its final valid position.
    ghost.y--;

    return ghost;
  });

  /**
   * Toggles the animation mode between 'smooth' and 'step' in the game state.
   */
  toggleAnimationMode(): void {
    this.state.animationMode.update(current => current === 'smooth' ? 'step' : 'smooth');
  }
}
