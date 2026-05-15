import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStore } from '../../../../store/game.store';
import { PlayerLabelPipe } from '../../../../shared/pipes/uppercase-mark.pipe';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, PlayerLabelPipe],
  template: `
    <div class="scoreboard">
      <div class="score-item">
        <span class="score-name x-color">{{ store.p1Name() | playerLabel }}</span>
        <span class="score-val  x-color">{{ store.scores().p1 }}</span>
      </div>
      <div class="score-mid">
        <span class="draw-label">DRAWS</span>
        <span class="score-val draw-color">{{ store.scores().draw }}</span>
      </div>
      <div class="score-item">
        <span class="score-name o-color">{{ store.p2Name() | playerLabel }}</span>
        <span class="score-val  o-color">{{ store.scores().p2 }}</span>
      </div>
    </div>`,
  styleUrls: ['./scoreboard.component.scss'],
})
export class ScoreboardComponent {
  readonly store = inject(GameStore);
}
