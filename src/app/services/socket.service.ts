import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from './game.service';
import { ToastService } from './toast.service';
import { SoundService } from './sound.service';
import { MoveResult, ServerRoom } from '../models/game.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: any = null;
  private socketClientLoading: Promise<void> | null = null;

  constructor(
    private game:  GameService,
    private toast: ToastService,
    private sound: SoundService,
    private router: Router,
  ) {}

  connect(): void {
    if (typeof (window as any)['io'] === 'undefined') {
      this.loadSocketClient()
        .then(() => this.connect())
        .catch(() => this.game.store.patch({ connected: false }));
      return;
    }
    if (this.socket?.connected) return;
    try {
      this.socket = (window as any)['io'](environment.socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });
      this.socket.on('connect',       () => this.game.store.patch({ connected: true }));
      this.socket.on('disconnect',    () => this.game.store.patch({ connected: false }));
      this.socket.on('connect_error', () => this.game.store.patch({ connected: false }));
      this._registerHandlers();
    } catch (e) { console.warn('[Socket]', e); }
  }

  private loadSocketClient(): Promise<void> {
    if (this.socketClientLoading) return this.socketClientLoading;
    this.socketClientLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${environment.socketUrl}/socket.io/socket.io.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        (window as any)._noServer = true;
        reject(new Error('Socket.IO client failed to load'));
      };
      document.head.appendChild(script);
    });
    return this.socketClientLoading;
  }

  isAvailable(): boolean { return !!this.socket?.connected; }

  private _registerHandlers(): void {
    const s = this.socket;

    s.on('room:created', (d: { room: ServerRoom }) => {
      this.game.store.patch({ room: { code: d.room.code, role: 'host' }, screen: 'waiting' });
      this.router.navigate(['/waiting']);
      this.toast.show('Room created. Share the code!', 'success');
    });

    s.on('room:joined', (d: { room: ServerRoom }) => {
      this.game.store.patch({ room: { code: d.room.code, role: 'guest' } });
    });

    s.on('game:start', (d: { room: ServerRoom }) => {
      const hp    = d.room.players.find(p => p.mark === 'X');
      const gp    = d.room.players.find(p => p.mark === 'O');
      const myMark = this.game.store.state().room.role === 'host' ? 'X' : 'O';
      this.game.startGame('mp', hp?.nickname || 'HOST', gp?.nickname || 'GUEST', myMark as 'X'|'O');
      this.game.applyFullServerState(d.room);
      this.toast.show('⚡ Game on!', 'success');
    });

    s.on('game:move', (d: { board: Mark[]; turn: 'X'|'O'; result: MoveResult|null; scores?: any }) => {
      this.game.applyServerMove(d.board, d.turn, d.result, d.scores);
      if (d.result?.winner === 'draw') this.sound.playDraw();
      else if (d.result?.winner)       this.sound.playWin();
    });

    s.on('game:expand', (d: { gridSize: number; board: any[]; turn: 'X'|'O' }) => {
      this.sound.playExpand();
      this.toast.show(`⊞ Grid expanded to ${d.gridSize}×${d.gridSize}!`, 'warning', 3500);
      this.game.applyServerExpand(d.gridSize, d.board, d.turn);
    });

    s.on('game:rematch', (d: { room: ServerRoom }) => {
      this.game.applyFullServerState(d.room);
      this.game.store.patch({ winner: null, winCombo: [], gameActive: true });
      this.toast.show('🔄 Rematch!', 'success');
    });

    s.on('game:rematch-waiting',   (d: any) => this.toast.show('⏳ ' + d.message, ''));
    s.on('game:rematch-requested', (d: any) => this.toast.show('🎮 ' + d.message, 'success', 4000));
    s.on('room:opponent-left',     (d: any) => {
      this.toast.show('😢 ' + d.message, 'warning', 4000);
      this.game.store.patch({ gameActive: false });
    });
    s.on('room:error', (d: any) => { this.toast.show('⚠ ' + d.message, 'error'); this.sound.playError(); });
  }

  createRoom(nickname: string): void {
    if (!this.isAvailable()) { this.toast.show('Run: node server.js first', 'error', 5000); return; }
    this.socket.emit('room:create', { nickname });
  }
  joinRoom(nickname: string, code: string): void {
    if (!this.isAvailable()) { this.toast.show('Run: node server.js first', 'error', 5000); return; }
    this.socket.emit('room:join', { nickname, code: code.toUpperCase().trim() });
  }
  sendMove(code: string, index: number): void { this.socket?.emit('game:move', { code, index }); }
  requestRematch(code: string): void           { this.socket?.emit('game:rematch', { code }); }
  leaveRoom(code: string): void                { this.socket?.emit('room:leave', { code }); }
}

// Fix: re-export Mark for socket service to use
import { Mark } from '../models/game.models';
