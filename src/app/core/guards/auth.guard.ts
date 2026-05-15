/**
 * auth.guard.ts
 * Prevents access to multiplayer lobby if no nickname is saved.
 * Redirects to /auth if nickname is missing.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameStore } from '../../store/game.store';

export const authGuard: CanActivateFn = () => {
  const store  = inject(GameStore);
  const router = inject(Router);

  const nick = store.nickname() || localStorage.getItem('ttt_nick') || '';
  if (nick && nick.length >= 2) return true;

  router.navigate(['/auth']);
  return false;
};
