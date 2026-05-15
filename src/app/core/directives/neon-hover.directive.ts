/**
 * neon-hover.directive.ts  (Core — app-wide)
 * Adds a pulsing neon glow on hover to any host element.
 * Usage: <div neonHover> or <div neonHover="o">
 */
import { Directive, HostListener, HostBinding, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[neonHover]',
  standalone: true,
})
export class NeonHoverDirective {
  /** Pass 'x' or 'o' to pick colour; default is cyan (x) */
  @Input('neonHover') color: 'x' | 'o' | '' = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  private get glow(): string {
    return this.color === 'o'
      ? '0 0 18px rgba(255,77,166,.6), 0 0 36px rgba(255,77,166,.3)'
      : '0 0 18px rgba(0,220,255,.6), 0 0 36px rgba(0,220,255,.3)';
  }

  @HostListener('mouseenter') onEnter(): void {
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', this.glow);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'box-shadow .2s');
  }

  @HostListener('mouseleave') onLeave(): void {
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'none');
  }
}
