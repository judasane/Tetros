/**
 * @fileoverview Component for a single cell on the game board.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PIECE_COLORS } from '../../utils/constants';

/**
 * Represents a single cell in the game grid. Its appearance is determined
 * by the numeric `value` input.
 */
@Component({
  selector: 'app-cell',
  standalone: true,
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  /** 
   * The numeric value of the cell which determines its state and appearance.
   * - `0`: Empty
   * - `> 0`: A locked piece, value corresponds to a color index.
   * - `-1`: Ghost piece preview.
   * - `-2`: Aimer power-up target.
   * - `-3`: Part of a line being cleared.
   */
  value = input.required<number>();

  /**
   * Computes the appropriate Tailwind CSS classes for the cell based on its value.
   * @returns A string of CSS classes.
   */
  cellClass = computed(() => {
    const val = this.value();
    if (val > 0) {
      // Piece
      return `bg-${PIECE_COLORS[val]} shadow-inner shadow-white/20`;
    }
    if (val === -1) {
      // Ghost piece
      return 'bg-slate-500/30 border border-slate-400/50';
    }
     if (val === -2) {
      // Aimer target
      return 'bg-yellow-500/70 animate-pulse border-2 border-yellow-300';
    }
    if (val === -3) {
      // Line clearing animation
      return 'animate-line-clear';
    }
    // Empty cell
    return 'bg-slate-800';
  });
}
