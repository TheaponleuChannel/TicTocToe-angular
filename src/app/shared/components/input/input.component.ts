/**
 * InputComponent — Shared neon-styled text input.
 * Implements ControlValueAccessor for use with Angular Forms.
 * Usage: <app-input placeholder="NAME" [(ngModel)]="val" />
 */
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true,
  }],
  template: `
    <div class="input-wrap">
      <input
        class="neon-input"
        [class.has-error]="error"
        [placeholder]="placeholder"
        [maxlength]="maxlength"
        [type]="type"
        [autocomplete]="autocomplete"
        [(ngModel)]="innerVal"
        (ngModelChange)="onChange($event)"
        (blur)="onTouched()"
        (keydown.enter)="enter.emit($event)" />
      <span *ngIf="error" class="error-msg">{{ error }}</span>
    </div>`,
  styles: [`
    .input-wrap { width:100%;display:flex;flex-direction:column;gap:.35rem; }
    .neon-input { width:100%;background:rgba(0,220,255,.04);border:1px solid rgba(0,220,255,.18);
      border-radius:8px;color:#fff;font-family:'Orbitron',sans-serif;font-size:.82rem;
      letter-spacing:.1em;padding:.88rem 1.2rem;outline:none;transition:border-color .25s,box-shadow .25s;
      text-transform:uppercase; }
    .neon-input::placeholder { color:var(--dim);letter-spacing:.1em; }
    .neon-input:focus { border-color:var(--x-color);box-shadow:0 0 0 2px rgba(0,220,255,.18),var(--glow-x); }
    .neon-input.has-error { border-color:var(--o-color); }
    .error-msg { font-size:.72rem;color:var(--o-color);letter-spacing:.05em; }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() placeholder  = '';
  @Input() maxlength    = 64;
  @Input() type         = 'text';
  @Input() autocomplete = 'off';
  @Input() error        = '';
  @Output() enter       = new (class extends Function {})() as any; // workaround for EventEmitter import

  innerVal = '';

  onChange  = (_: any) => {};
  onTouched = () => {};

  writeValue(v: any): void { this.innerVal = v ?? ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}
// Fix the EventEmitter omission
import { Output, EventEmitter } from '@angular/core';
