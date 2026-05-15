/**
 * mark-color.pipe.ts
 * Returns a CSS variable string for X or O colour.
 * Usage: [style.color]="cell.mark | markColor"
 */
import { Pipe, PipeTransform } from '@angular/core';
import { Mark } from '../../models/game.models';

@Pipe({ name: 'markColor', standalone: true })
export class MarkColorPipe implements PipeTransform {
  transform(mark: Mark): string {
    if (mark === 'X') return 'var(--x-color)';
    if (mark === 'O') return 'var(--o-color)';
    return 'transparent';
  }
}
