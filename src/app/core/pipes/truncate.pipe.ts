/**
 * truncate.pipe.ts
 * Truncates a string to a max length, appending '…' if needed.
 * Usage: {{ 'Long name' | truncate:8 }}
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 10, trail = '…'): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit) + trail : value;
  }
}
