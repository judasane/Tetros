/**
 * @fileoverview Component for displaying a small preview of a Tetris piece.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PIECE_COLORS } from '../../utils/constants';

/**
 * Renders a small, static preview of a given piece shape.
 * Used for the "Next" and "Hold" displays.
 */
@Component({
  selector: 'app-piece-preview',
  standalone: true,
  templateUrl: './piece-preview.component.html',
  styleUrls: ['./piece-preview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PiecePreviewComponent {
  /** The 2D array representing the shape of the piece to be displayed. */
  piece = input.required<number[][]>();
  
  /** A map of color indices to Tailwind CSS color names. */
  colors = PIECE_COLORS;
}
