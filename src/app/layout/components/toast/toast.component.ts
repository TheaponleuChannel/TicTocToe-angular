import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px) scale(.95)' }),
        animate('280ms cubic-bezier(.3,1.5,.5,1)', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':leave', [
        animate('220ms ease', style({ opacity: 0, transform: 'translateY(8px) scale(.95)' })),
      ]),
    ]),
  ],
  template: `
    <div class="toast-container" aria-live="polite">
      <div *ngFor="let t of svc.toasts(); trackBy: trackToast"
           @toastAnim
           class="toast"
           [class]="'toast toast--' + t.type"
           (click)="svc.dismiss(t.id)">
        {{ t.message }}
      </div>
    </div>`,
  styles: [`
    .toast-container { position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
      display:flex;flex-direction:column;gap:.5rem;align-items:center;z-index:9999;pointer-events:none; }
    .toast { font-family:'Orbitron',sans-serif;font-size:.68rem;letter-spacing:.1em;
      background:rgba(13,21,38,.96);border:1px solid rgba(0,220,255,.5);
      border-radius:30px;padding:.65rem 1.5rem;color:#fff;white-space:nowrap;
      pointer-events:all;cursor:pointer;
      box-shadow:0 0 20px rgba(0,220,255,.2),0 4px 20px rgba(0,0,0,.5); }
    .toast--error   { border-color:rgba(255,77,166,.6);color:#ff4da6; }
    .toast--warning { border-color:rgba(255,209,102,.6);color:#ffd166; }
    .toast--success { border-color:rgba(0,220,255,.7); }
    .toast--info    { border-color:rgba(100,180,255,.6);color:#64b4ff; }
  `]
})
export class ToastComponent {
  svc = inject(ToastService);
  trackToast = (_: number, t: any) => t.id;
}
