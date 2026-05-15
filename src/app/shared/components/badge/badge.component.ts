/**
 * BadgeComponent — Small pill badge (mode, status, mark labels).
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [class]="'badge--' + color"><ng-content></ng-content></span>`,
  styles: [`
    .badge { font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:700;
      letter-spacing:.18em;border-radius:30px;padding:.3rem .85rem;border:1px solid;
      white-space:nowrap; }
    .badge--x     { color:var(--x-color);border-color:rgba(0,220,255,.4);background:rgba(0,220,255,.08); }
    .badge--o     { color:var(--o-color);border-color:rgba(255,77,166,.4);background:rgba(255,77,166,.08); }
    .badge--draw  { color:var(--draw);border-color:rgba(255,209,102,.4);background:rgba(255,209,102,.08); }
    .badge--dim   { color:var(--dim);border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.03); }
  `]
})
export class BadgeComponent {
  @Input() color: 'x' | 'o' | 'draw' | 'dim' = 'dim';
}
