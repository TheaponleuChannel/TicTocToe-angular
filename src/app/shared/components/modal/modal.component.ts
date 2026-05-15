/**
 * ModalComponent — Overlay modal for confirmations/prompts.
 * Usage: <app-modal [visible]="showModal" title="Confirm" (closed)="showModal=false">
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" [class.visible]="visible" (click)="onBackdrop($event)">
      <div class="modal-box" role="dialog" [attr.aria-label]="title">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" (click)="closed.emit()">✕</button>
        </div>
        <div class="modal-body"><ng-content></ng-content></div>
      </div>
    </div>`,
  styles: [`
    .modal-backdrop { position:fixed;inset:0;background:rgba(7,11,20,.85);backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;z-index:200;
      opacity:0;pointer-events:none;transition:opacity .3s; }
    .modal-backdrop.visible { opacity:1;pointer-events:all; }
    .modal-box  { background:var(--panel,rgba(13,21,38,.9));border:1px solid rgba(0,220,255,.2);
      border-radius:16px;padding:2rem;width:min(420px,90vw);
      box-shadow:0 0 40px rgba(0,220,255,.08),0 24px 60px rgba(0,0,0,.6); }
    .modal-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem; }
    .modal-title  { font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:700;
      letter-spacing:.15em;color:#fff; }
    .modal-close  { background:none;border:none;color:var(--dim,#5a7a99);font-size:1rem;
      cursor:pointer;padding:.2rem .4rem;transition:color .2s; }
    .modal-close:hover { color:#fff; }
    .modal-body   { color:var(--text,#d4e9f7);font-size:.9rem;line-height:1.6; }
  `]
})
export class ModalComponent {
  @Input()  title   = '';
  @Input()  visible = false;
  @Output() closed  = new EventEmitter<void>();

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closed.emit();
    }
  }
}
