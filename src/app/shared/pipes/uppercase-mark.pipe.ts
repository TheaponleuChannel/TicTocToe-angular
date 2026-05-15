/**
 * uppercase-mark.pipe.ts (Shared)
 * Formats a player name for display: uppercase + truncate.
 * Usage: {{ name | playerLabel:8 }}
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'playerLabel', standalone: true })
export class PlayerLabelPipe implements PipeTransform {
  transform(value: string, limit = 8): string {
    if (!value) return '---';
    return value.slice(0, limit).toUpperCase();
  }
}
