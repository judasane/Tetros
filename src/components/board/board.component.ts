/**
 * @fileoverview Component for rendering the main game board.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CellComponent } from '../cell/cell.component';
import { COLS } from '../../utils/constants';
import { Piece } from '../../utils/piece.interface';
import { FallingPieceComponent } from '../falling-piece/falling-piece.component';

/**
 * Renders the game board, including the static grid of locked pieces
 * and the animated falling and ghost pieces.
 */
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CellComponent, FallingPieceComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent {
  /** The number of columns on the board. */
  readonly COLS = COLS;
  
  /** The 2D array representing the static, locked-in pieces on the board. */
  boardInput = input.required<number[][]>({ alias: 'board' });
  
  /** The currently falling piece, or null if none. */
  currentPiece = input.required<Piece | null>();
  
  /** The ghost piece showing the final drop position, or null if none. */
  ghostPiece = input.required<Piece | null>();

  /** The user-selected animation mode for piece movement. */
  animationMode = input<'step' | 'smooth'>('smooth');

  /** The fractional progress of the current piece's drop between two cells (0 to 1), used for smooth animation. */
  dropProgress = input<number>(0);

  /** The size of a single cell in pixels, used for dynamic board scaling. */
  cellSize = input<number>(32);

  /** A computed signal that directly passes the board input to the template. */
  boardToRender = computed(() => this.boardInput());
}
