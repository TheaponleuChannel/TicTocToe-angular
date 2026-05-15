/**
 * click-sound.directive.ts
 * Plays a subtle UI click sound on any element it decorates.
 * Usage: <button clickSound>
 */
import { Directive, HostListener, inject } from '@angular/core';
import { SoundService } from '../../services/sound.service';

@Directive({
  selector: '[clickSound]',
  standalone: true,
})
export class ClickSoundDirective {
  private sound = inject(SoundService);

  @HostListener('click')
  onClick(): void {
    this.sound.playPlace('X');
  }
}
