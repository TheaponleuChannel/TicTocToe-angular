import {
  Component, inject, computed, TrackByFunction,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStore }   from '../../../../store/game.store';
import { GameService } from '../../../../services/game.service';
import { SocketService } from '../../../../services/socket.service';
import { SoundService }  from '../../../../services/sound.service';
import { ToastService }  from '../../../../services/toast.service';
import { Cell } from '../../../../models/game.models';
import { MarkColorPipe } from '../../../../core/pipes/mark-color.pipe';
import { RippleDirective } from '../../../../shared/directives/ripple.directive';

@Component({
  selector: 'app-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MarkColorPipe, RippleDirective],
  templateUrl: './board.component.html',
  styleUrls:   ['./board.component.scss'],
})
export class BoardComponent {
  private store  = inject(GameStore);
  private game   = inject(GameService);
  private socket = inject(SocketService);
  private sound  = inject(SoundService);
  private toast  = inject(ToastService);

  readonly cells       = this.store.cells;
  readonly gridSize    = this.store.gridSize;
  readonly isExpanding = this.store.expanding;

  readonly nextSize = computed(() => this.store.gridSize() * 2);

  /** Dynamic cell size: shrinks as grid grows */
  readonly cellPx = computed(() => {
    const sz = this.store.gridSize();
    if (sz <= 12) return 44;
    if (sz <= 24) return 30;
    if (sz <= 48) return 20;
    return 14;
  });

  /** Total board pixel size for the grid container */
  readonly boardPx = computed(() => {
    const sz   = this.store.gridSize();
    const cell = this.cellPx();
    return sz * cell + (sz - 1) * 4;
  });

  /** CSS grid columns string */
  readonly gridCols = computed(() => `repeat(${this.store.gridSize()}, 1fr)`);

  trackCell: TrackByFunction<Cell> = (_, c) => c.index;

  canClick(): boolean {
    const s = this.store.state();
    return s.gameActive && !s.expanding && !s.winner;
  }

  onClick(cell: Cell): void {
    const s = this.store.state();
    if (!this.canClick() || cell.mark) return;

    if (s.mode === 'ai') {
      if (s.currentTurn !== 'X') return;
      this.sound.playPlace('X');
      const result = this.game.placeMarkLocal(cell.index);
      if (result?.winner) {
        result.winner === 'draw' ? this.sound.playDraw() : this.sound.playWin();
        return;
      }
      // Trigger AI move after brief delay
      const st = this.store.state();
      if (st.gameActive && st.currentTurn === 'O') {
        setTimeout(() => this.doAIMove(), 380);
      }

    } else if (s.mode === 'mp') {
      if (!this.store.isMyTurn()) {
        this.toast.show("Wait for your opponent's move", 'warning');
        return;
      }
      this.sound.playPlace(s.currentTurn);
      if (s.room.code) this.socket.sendMove(s.room.code, cell.index);
    }
  }

  private doAIMove(): void {
    const s = this.store.state();
    if (!s.gameActive || s.currentTurn !== 'O') return;
    const board = this.store.boardFlat();
    const idx   = this.game.getBestMove([...board], s.gridSize, 'O');
    if (idx === -1) return;
    this.sound.playPlace('O');
    const result = this.game.placeMarkLocal(idx);
    if (result?.winner) {
      result.winner === 'draw' ? this.sound.playDraw() : this.sound.playWin();
    }
  }
}
