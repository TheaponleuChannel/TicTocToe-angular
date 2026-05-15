/**
 * autofocus.directive.ts (Shared)
 * Focuses the host element after view init (works in Angular unlike HTML autofocus).
 * Usage: <input appAutofocus />
 */
import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({ selector: '[appAutofocus]', standalone: true })
export class AutofocusDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}
  ngAfterViewInit(): void {
    setTimeout(() => this.el.nativeElement.focus(), 100);
  }
}
