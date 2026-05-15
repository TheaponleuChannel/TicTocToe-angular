import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId  = 1;

  show(message: string, type: ToastType = '', duration = 2800): void {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, message, type, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
