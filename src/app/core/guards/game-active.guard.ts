/**
 * game-active.guard.ts
 * Prevents navigating to /game if no game session is active.
 * Redirects to /menu.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameStore } from '../../store/game.store';

export const gameActiveGuard: CanActivateFn = () => {
  const store  = inject(GameStore);
  const router = inject(Router);

  if (store.mode() !== null) return true;

  router.navigate(['/menu']);
  return false;
};
