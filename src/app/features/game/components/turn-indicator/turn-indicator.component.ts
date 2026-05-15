import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStore } from '../../../../store/game.store';

@Component({
  selector: 'app-turn-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="turn-bar"
         [class.x-turn]="store.currentTurn() === 'X'"
         [class.o-turn]="store.currentTurn() === 'O'">
      <span class="turn-mark"
            [class.x-color]="store.currentTurn() === 'X'"
            [class.o-color]="store.currentTurn() === 'O'">
        {{ store.currentTurn() }}
      </span>
      <span class="turn-label">{{ turnLabel() }}</span>
      <span *ngIf="store.mode() === 'mp'" class="my-mark-badge">
        You:&nbsp;
        <b [class.x-color]="store.myMark() === 'X'"
           [class.o-color]="store.myMark() === 'O'">
          {{ store.myMark() }}
        </b>
      </span>
    </div>`,
  styleUrls: ['./turn-indicator.component.scss'],
})
export class TurnIndicatorComponent {
  readonly store = inject(GameStore);

  turnLabel(): string {
    const s = this.store.state();
    if (s.mode === 'mp') {
      return s.myMark === s.currentTurn ? 'Your Turn' : `${this.store.turnPlayerName()}'s Turn`;
    }
    return s.currentTurn === 'X' ? 'Your Turn' : 'AI Thinking…';
  }
}
