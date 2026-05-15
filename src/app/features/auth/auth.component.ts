import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AutofocusDirective } from '../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, AutofocusDirective],
  template: `
    <div class="panel">
      <button class="btn-back" (click)="back()">‹ BACK</button>
      <h2 class="panel-title">ENTER THE GRID</h2>
      <p  class="panel-sub">Choose a callsign to continue</p>
      <div class="input-group">
        <input class="neon-input" [(ngModel)]="name" appAutofocus
               placeholder="YOUR CALLSIGN" maxlength="16"
               (keydown.enter)="login()" autocomplete="off" />
      </div>
      <app-button variant="primary" style="width:100%" (clicked)="login()">
        Continue as Guest
      </app-button>
    </div>`,
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  private game  = inject(GameService);
  private toast = inject(ToastService);
  private router= inject(Router);
  name = '';

  login(): void {
    const n = this.name.trim();
    if (!n || n.length < 2) { this.toast.show('Enter a callsign (min 2 chars)', 'error'); return; }
    this.game.saveNickname(n);
    this.router.navigate(['/lobby']);
  }
  back(): void { this.router.navigate(['/menu']); }
}
