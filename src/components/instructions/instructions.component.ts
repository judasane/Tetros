import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InfoPanelComponent } from '../info-panel/info-panel.component';

@Component({
  selector: 'app-instructions',
  template: `
    <app-info-panel title="How to Play">
      @if (isDesktop) {
        <div class="p-2 text-slate-300">
          <ul class="list-disc list-inside">
            <li><span class="font-bold text-yellow-400">Left/Right:</span> Move piece</li>
            <li><span class="font-bold text-yellow-400">Down:</span> Soft drop</li>
            <li><span class="font-bold text-yellow-400">Space:</span> Hard drop</li>
            <li><span class="font-bold text-yellow-400">Up:</span> Rotate</li>
            <li><span class="font-bold text-yellow-400">C:</span> Hold piece</li>
            <li><span class="font-bold text-yellow-400">P:</span> Pause game</li>
          </ul>
        </div>
      } @else {
        <div class="p-2 text-slate-300">
          <ul class="list-disc list-inside">
            <li><span class="font-bold text-yellow-400">Swipe Left/Right:</span> Move piece</li>
            <li><span class="font-bold text-yellow-400">Swipe Down:</span> Soft drop</li>
            <li><span class="font-bold text-yellow-400">Fast Swipe Down:</span> Hard drop</li>
            <li><span class="font-bold text-yellow-400">Tap:</span> Rotate</li>
            <li><span class="font-bold text-yellow-400">"Hold" Button:</span> Hold piece</li>
            <li><span class="font-bold text-yellow-400">"Pause" Button:</span> Pause game</li>
          </ul>
        </div>
      }
    </app-info-panel>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [InfoPanelComponent]
})
export class InstructionsComponent {
  @Input() isDesktop = true;
}