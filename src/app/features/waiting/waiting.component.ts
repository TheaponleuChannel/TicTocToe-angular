import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStore } from '../../store/game.store';
import { SocketService } from '../../services/socket.service';
import { ToastService } from '../../services/toast.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-waiting',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.scss'],
})
export class WaitingComponent {
  private store = inject(GameStore);
  private socket = inject(SocketService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly room = this.store.room;
  readonly connected = this.store.connected;
  copied = false;

  copy(): void {
    const code = this.store.room().code;
    if (!code) return;

    const onCopied = () => {
      this.copied = true;
      this.toast.show('Code copied!', 'success');
      setTimeout(() => this.copied = false, 1600);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
        .then(onCopied)
        .catch(() => this.copyFallback(code, onCopied));
      return;
    }

    this.copyFallback(code, onCopied);
  }

  private copyFallback(code: string, onCopied: () => void): void {
    const input = document.createElement('textarea');
    input.value = code;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand('copy');
      onCopied();
    } catch {
      this.toast.show(`Room code: ${code}`, 'info', 5000);
    } finally {
      document.body.removeChild(input);
    }
  }

  leave(): void {
    const code = this.store.room().code;
    if (code) this.socket.leaveRoom(code);
    this.store.patch({ room: { code: null, role: null } });
    this.router.navigate(['/lobby']);
  }
}
