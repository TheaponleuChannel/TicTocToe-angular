import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameStore } from '../../store/game.store';
import { SocketService } from '../../services/socket.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  private store  = inject(GameStore);
  private socket = inject(SocketService);
  private toast  = inject(ToastService);
  private router = inject(Router);
  readonly nickname = this.store.nickname;
  code = '';
  creating = false;

  ngOnInit(): void {
    this.socket.connect().catch(() => {});
  }

  async create(): Promise<void> {
    this.creating = true;
    await this.socket.createRoom(this.store.nickname());
    if (!this.socket.isAvailable()) this.creating = false;
  }

  async join(): Promise<void> {
    if (this.code.trim().length !== 6) { this.toast.show('Enter a 6-character code','error'); return; }
    await this.socket.joinRoom(this.store.nickname(), this.code);
  }
  back(): void { this.router.navigate(['/menu']); }
}
