import { Component, inject, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStore } from '../../../../store/game.store';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-result-overlay',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="result-overlay" [class.visible]="!!store.winner()" role="dialog" aria-modal="true">
      <div class="result-box">
        <div class="result-icon">{{ icon() }}</div>
        <h2 class="result-title" [style.color]="titleColor()">{{ heading() }}</h2>
        <p  class="result-sub">{{ sub() }}</p>
        <div class="result-btns">
          <app-button variant="primary"   (clicked)="playAgain.emit()">{{ playAgainLabel }}</app-button>
          <app-button variant="ghost"     (clicked)="menu.emit()">Main Menu</app-button>
        </div>
      </div>
    </div>`,
  styleUrls: ['./result-overlay.component.scss'],
})
export class ResultOverlayComponent {
  readonly store = inject(GameStore);

  @Output() playAgain = new EventEmitter<void>();
  @Output() menu      = new EventEmitter<void>();

  playAgainLabel = 'Play Again';

  icon       = computed(() => this.store.winner() === 'draw' ? '🤝' : '🏆');
  titleColor = computed(() => {
    const w = this.store.winner();
    return w === 'X' ? 'var(--x-color)' : w === 'O' ? 'var(--o-color)' : 'var(--draw)';
  });
  heading = computed(() => {
    const w = this.store.winner(); const s = this.store.state();
    if (w === 'draw') return 'DRAW!';
    if (w === 'X')    return s.p1Name.slice(0,10).toUpperCase() + ' WINS!';
    if (w === 'O')    return s.p2Name.slice(0,10).toUpperCase() + ' WINS!';
    return '';
  });
  sub = computed(() => {
    const w = this.store.winner();
    return w === 'draw' ? 'No winner — great battle!' : w ? 'Excellent strategy! 🎯' : '';
  });

  setLabel(label: string): void { this.playAgainLabel = label; }
}
