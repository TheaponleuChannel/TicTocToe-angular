/**
 * PanelComponent — Glassmorphism panel wrapper.
 * Usage: <app-panel title="TITLE" subtitle="sub">content</app-panel>
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <h2 *ngIf="title" class="panel-title">{{ title }}</h2>
      <p  *ngIf="subtitle" class="panel-sub">{{ subtitle }}</p>
      <ng-content></ng-content>
    </div>`,
  styles: [`:host { display:contents; }`]
})
export class PanelComponent {
  @Input() title    = '';
  @Input() subtitle = '';
}
