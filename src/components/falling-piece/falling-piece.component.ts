/**
 * @fileoverview Component for rendering the animated, currently falling piece.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Piece } from '../../utils/piece.interface';
import { PIECE_COLORS } from '../../utils/constants';

/**
 * A component dedicated to rendering the currently falling piece and its ghost.
 * It is positioned absolutely over the main board and uses CSS transitions for smooth movement.
 */
@Component({
  selector: 'app-falling-piece',
  standalone: true,
  templateUrl: './falling-piece.component.html',
  styleUrls: ['./falling-piece.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FallingPieceComponent {
  /** The piece object to be rendered. */
  piece = input.required<Piece>();
  /** Whether this piece should be rendered as a semi-transparent ghost. */
  isGhost = input<boolean>(false);
  /** The current animation mode ('step' or 'smooth'). */
  animationMode = input<'step' | 'smooth'>('smooth');
  /** The fractional progress (0-1) of the piece's drop, for smooth animation. */
  dropProgress = input<number>(0);
  /** The size of a single cell in pixels, used for dynamic scaling. */
  cellSize = input<number>(32);

  /** A computed signal for the piece's shape matrix. */
  pieceShape = computed(() => this.piece().shape);
  
  /**
   * Computes the `top` and `left` CSS properties in pixels for positioning the piece.
   * In smooth mode, it incorporates `dropProgress` for fluid vertical movement.
   */
  position = computed(() => {
    const piece = this.piece();
    const size = this.cellSize();
    // In smooth mode, add the fractional drop progress for a fluid animation.
    const yOffset = (this.animationMode() === 'smooth' && !this.isGhost()) 
      ? this.dropProgress() 
      : 0;
    
    return {
        left: piece.x * size,
        top: (piece.y + yOffset) * size,
    };
  });

  /**
   * Computes the `transition` CSS property based on the animation mode.
   * In 'smooth' mode, vertical transitions are disabled as `top` is updated per frame.
   * In 'step' mode, all transforms are transitioned.
   */
  transitionStyle = computed(() => {
    const duration = '100ms';
    const timing = 'ease-out';
    
    // The ghost piece should always have a quick transition for all movements.
    if (this.isGhost()) {
      return `all ${duration} ${timing}`;
    }

    // In smooth mode, `top` is updated every frame, so we only transition horizontal movement.
    if (this.animationMode() === 'smooth') {
      return `left ${duration} ${timing}`;
    }

    // In step mode, we transition all movements for a classic, snappy feel.
    return `all ${duration} ${timing}`;
  });

  /** Private reference to the color map. */
  private colors = PIECE_COLORS;
  
  /**
   * Gets the appropriate CSS classes for a single cell within the falling piece.
   * @param cellValue The numeric value of the cell from the piece's shape matrix.
   * @returns A string of Tailwind CSS classes.
   */
  getCellClass(cellValue: number): string {
    if (cellValue <= 0) {
      return 'bg-transparent';
    }
    if (this.isGhost()) {
      return 'bg-slate-500/30 border border-slate-400/50';
    }
    return `bg-${this.colors[cellValue]} shadow-inner shadow-white/20 border border-slate-700/50`;
  }
}
