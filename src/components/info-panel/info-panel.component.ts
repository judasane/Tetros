/**
 * @fileoverview A reusable panel component for displaying game information.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A generic, styled container component with a title. It is used to display
 * various pieces of game information like score, next piece, etc., using content projection.
 */
@Component({
  selector: 'app-info-panel',
  standalone: true,
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPanelComponent {
  /** The title to be displayed at the top of the panel. */
  title = input<string | undefined>();
}