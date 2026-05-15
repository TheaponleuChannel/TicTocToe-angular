import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStore }   from '../../store/game.store';
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

  toggleSound(): void { this.sound.toggle(); this.soundOn = this.sound.enabled; }

  openGuide(): void { this.router.navigate(['/guide']); }

  restart(): void {
    if (this.store.mode() === 'ai') {
      this.game.resetBoard();
    }
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
