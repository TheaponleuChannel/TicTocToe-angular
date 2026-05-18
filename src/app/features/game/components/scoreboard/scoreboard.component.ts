import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStore } from '../../../../store/game.store';
import { SocketService } from '../../../../services/socket.service';
import { QuickPlayEvent } from '../../../../models/game.models';
import { PlayerLabelPipe } from '../../../../shared/pipes/uppercase-mark.pipe';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, PlayerLabelPipe],
  template: `
    <div class="scoreboard">
      <div class="score-item">
        <div class="name-row">
          <span class="score-name x-color">{{ store.p1Name() | playerLabel }}</span>
          <span *ngIf="activeQuickEvent?.mark === 'X'" class="chat-bubble x-bubble">
            {{ activeQuickEvent?.content }}
          </span>
        </div>
        <span class="score-val  x-color">{{ store.scores().p1 }}</span>
      </div>
      <div class="score-mid">
        <span class="draw-label">DRAWS</span>
        <span class="score-val draw-color">{{ store.scores().draw }}</span>
      </div>
      <div class="score-item">
        <div class="name-row">
          <span class="score-name o-color">{{ store.p2Name() | playerLabel }}</span>
          <span *ngIf="activeQuickEvent?.mark === 'O'" class="chat-bubble o-bubble">
            {{ activeQuickEvent?.content }}
          </span>
        </div>
        <span class="score-val  o-color">{{ store.scores().p2 }}</span>
      </div>
    </div>`,
  styleUrls: ['./scoreboard.component.scss'],
})
export class ScoreboardComponent {
  readonly store = inject(GameStore);
  private readonly socket = inject(SocketService);
  activeQuickEvent: QuickPlayEvent | null = null;
  private quickEventTimer: any;

  constructor() {
    effect(() => {
      const event = this.socket.quickPlayEvent();
      if (!event) return;
      this.activeQuickEvent = event;
      clearTimeout(this.quickEventTimer);
      this.quickEventTimer = setTimeout(() => this.activeQuickEvent = null, 3200);
    });
  }
}
