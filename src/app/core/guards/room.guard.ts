/**
 * room.guard.ts
 * Prevents navigating to /waiting if no room code exists.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameStore } from '../../store/game.store';

export const roomGuard: CanActivateFn = () => {
  const store  = inject(GameStore);
  const router = inject(Router);

  if (store.room().code) return true;

  router.navigate(['/lobby']);
  return false;
};
