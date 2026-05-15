/**
 * ButtonComponent — Shared reusable neon button.
 * Usage: <app-button variant="primary" [disabled]="loading" (clicked)="doSomething()">Label</app-button>
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn"
      [class]="'btn btn-' + variant"
      [class.loading]="loading"
      [disabled]="disabled || loading"
      (click)="!disabled && !loading && clicked.emit($event)">
      <span *ngIf="loading" class="spinner"></span>
      <ng-content></ng-content>
    </button>`,
  styles: [`
    .btn { display:flex;align-items:center;justify-content:center;gap:.55rem;
      font-family:'Orbitron',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.14em;
      border:none;border-radius:8px;padding:.82rem 1.5rem;cursor:pointer;
      text-transform:uppercase;transition:all .2s;position:relative;overflow:hidden;
      -webkit-tap-highlight-color:transparent; }
    .btn:disabled { opacity:.45;cursor:not-allowed;transform:none!important; }
    .btn-primary   { background:linear-gradient(135deg,rgba(0,220,255,.15),rgba(0,220,255,.05));
      border:1px solid rgba(0,220,255,.5);color:var(--x-color);box-shadow:0 0 18px rgba(0,220,255,.3); }
    .btn-primary:not(:disabled):hover { border-color:var(--x-color);box-shadow:0 0 28px rgba(0,220,255,.55);transform:translateY(-2px); }
    .btn-secondary { background:linear-gradient(135deg,rgba(255,77,166,.12),rgba(255,77,166,.04));
      border:1px solid rgba(255,77,166,.45);color:var(--o-color);box-shadow:0 0 18px rgba(255,77,166,.25); }
    .btn-secondary:not(:disabled):hover { border-color:var(--o-color);box-shadow:0 0 28px rgba(255,77,166,.5);transform:translateY(-2px); }
    .btn-ghost  { background:rgba(255,255,255,.04);border:1px solid rgba(0,220,255,.18);color:var(--dim); }
    .btn-ghost:not(:disabled):hover { border-color:rgba(255,255,255,.3);color:var(--text); }
    .btn-danger { background:rgba(255,77,77,.08);border:1px solid rgba(255,77,77,.4);color:#ff4d4d; }
    .spinner { width:14px;height:14px;border:2px solid rgba(255,255,255,.2);border-top-color:currentColor;
      border-radius:50%;animation:spin .6s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class ButtonComponent {
  @Input() variant:  ButtonVariant = 'primary';
  @Input() disabled  = false;
  @Input() loading   = false;
  @Output() clicked  = new EventEmitter<MouseEvent>();
}
