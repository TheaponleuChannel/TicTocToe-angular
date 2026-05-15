/**
 * ripple.directive.ts (Shared)
 * Adds a material-style ripple effect on click.
 * Usage: <div appRipple>
 */
import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({ selector: '[appRipple]', standalone: true })
export class RippleDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent): void {
    const host = this.el.nativeElement as HTMLElement;
    const rect  = host.getBoundingClientRect();
    const size  = Math.max(rect.width, rect.height);
    const x     = e.clientX - rect.left - size / 2;
    const y     = e.clientY - rect.top  - size / 2;

    const ripple = this.renderer.createElement('span');
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'width',    `${size}px`);
    this.renderer.setStyle(ripple, 'height',   `${size}px`);
    this.renderer.setStyle(ripple, 'left',     `${x}px`);
    this.renderer.setStyle(ripple, 'top',      `${y}px`);
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'background', 'rgba(0,220,255,.25)');
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'animation', 'ripple-anim .5s linear');
    this.renderer.setStyle(ripple, 'pointer-events', 'none');
    this.renderer.appendChild(host, ripple);
    setTimeout(() => this.renderer.removeChild(host, ripple), 500);
  }
}
