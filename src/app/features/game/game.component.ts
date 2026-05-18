import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { GameStore }   from '../../store/game.store';
import { QuickPlayKind } from '../../models/game.models';
import { GameService } from '../../services/game.service';
import { SocketService } from '../../services/socket.service';
import { SoundService }  from '../../services/sound.service';
import { BoardComponent }         from './components/board/board.component';
import { ScoreboardComponent }    from './components/scoreboard/scoreboard.component';
import { TurnIndicatorComponent } from './components/turn-indicator/turn-indicator.component';
import { ResultOverlayComponent } from './components/result-overlay/result-overlay.component';
import { ConfettiComponent }      from '../../layout/components/confetti/confetti.component';
import { BadgeComponent }         from '../../shared/components/badge/badge.component';
import { ButtonComponent }        from '../../shared/components/button/button.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BoardComponent,
    ScoreboardComponent,
    TurnIndicatorComponent,
    ResultOverlayComponent,
    ConfettiComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './game.component.html',
  styleUrls:   ['./game.component.scss'],
})
export class GameComponent {
  @ViewChild(ResultOverlayComponent) resultOverlay?: ResultOverlayComponent;

  private store  = inject(GameStore);
  private game   = inject(GameService);
  private socket = inject(SocketService);
  private sound  = inject(SoundService);
  private router = inject(Router);

  readonly state     = this.store.state;
  readonly mode      = this.store.mode;
  readonly connected = this.store.connected;
  soundOn            = this.sound.enabled;
  activeQuickPanel: QuickPlayKind | null = null;
  customMessage = '';
  myLastMessage = signal<string | null>(null);

  readonly stickers = ['😀','😂','😎','😮','😢','😡','👏','🔥','💯','🏆'];
  readonly quickMessages = [
    'Well played!',
    'Why you think too long!',
    "I can't wait anymore!",
    'Haha you so noob.',
    'Train more before invite me',
    'Nice move!',
    'That was risky.',
    'Your turn, champion.',
    'I saw that coming.',
    'Rematch after this?'
  ];

  toggleSound(): void { this.sound.toggle(); this.soundOn = this.sound.enabled; }

  openGuide(): void { this.router.navigate(['/guide']); }

  restart(): void {
    if (this.store.mode() === 'ai') {
      this.game.resetBoard();
    }
  }

  toggleQuickPanel(panel: QuickPlayKind): void {
    this.activeQuickPanel = this.activeQuickPanel === panel ? null : panel;
  }

  private showMyMessage(content: string): void {
    this.myLastMessage.set(content);
    setTimeout(() => this.myLastMessage.set(null), 3000);
  }

  sendSticker(sticker: string): void {
    const s = this.store.state();
    if (s.mode !== 'mp' || !s.room.code || !this.socket.isAvailable()) return;
    this.socket.sendQuickPlay(s.room.code, 'sticker', sticker);
    this.showMyMessage(sticker);
    this.activeQuickPanel = 'message';
  }

  sendPresetMessage(message: string): void {
    const s = this.store.state();
    if (s.mode !== 'mp' || !s.room.code || !this.socket.isAvailable()) return;
    this.socket.sendQuickPlay(s.room.code, 'message', message);
    this.showMyMessage(message);
  }

  sendCustomMessage(): void {
    const message = this.customMessage.trim();
    if (!message) return;
    const s = this.store.state();
    if (s.mode !== 'mp' || !s.room.code || !this.socket.isAvailable()) return;
    this.socket.sendQuickPlay(s.room.code, 'message', message);
    this.showMyMessage(message);
    this.customMessage = '';
  }

  goMenu(): void {
    const s = this.store.state();
    if (s.mode === 'mp' && s.room.code) this.socket.leaveRoom(s.room.code);
    this.store.patch({ room: { code: null, role: null }, mode: null });
    this.router.navigate(['/menu']);
  }

  onPlayAgain(): void {
    const s = this.store.state();
    if (s.mode === 'ai') {
      this.game.resetBoard();
    } else if (s.mode === 'mp' && s.room.code) {
      this.resultOverlay?.setLabel('WAITING…');
      this.socket.requestRematch(s.room.code);
    }
  }
}
