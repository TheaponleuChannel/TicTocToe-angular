/**
 * app.routes.ts
 * ─────────────────────────────────────────────────────────────
 * Application router configuration using Angular 18 standalone.
 *
 * All feature routes are LAZILY LOADED — the bundle for each
 * screen is only fetched when the user navigates to it.
 *
 * Guards:
 *  authGuard      → /lobby & /waiting  (must have nickname)
 *  gameActiveGuard → /game             (must have an active session)
 *  roomGuard      → /waiting           (must have a room code)
 */
import { Routes } from '@angular/router';
import { authGuard }       from './core/guards/auth.guard';
import { gameActiveGuard } from './core/guards/game-active.guard';
import { roomGuard }       from './core/guards/room.guard';

export const routes: Routes = [
  {
    path: 'loading',
    loadComponent: () =>
      import('./features/loading/loading.component').then(m => m.LoadingComponent),
    title: 'Neon Gomoku — Loading',
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./features/menu/menu.component').then(m => m.MenuComponent),
    title: 'Neon Gomoku — Menu',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then(m => m.AuthComponent),
    title: 'Neon Gomoku — Sign In',
  },
  {
    path: 'lobby',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/lobby/lobby.component').then(m => m.LobbyComponent),
    title: 'Neon Gomoku — Lobby',
  },
  {
    path: 'waiting',
    canActivate: [authGuard, roomGuard],
    loadComponent: () =>
      import('./features/waiting/waiting.component').then(m => m.WaitingComponent),
    title: 'Neon Gomoku — Waiting Room',
  },
  {
    path: 'game',
    canActivate: [gameActiveGuard],
    loadComponent: () =>
      import('./features/game/game.component').then(m => m.GameComponent),
    title: 'Neon Gomoku — Playing',
  },
  {
    path: 'guide',
    loadComponent: () =>
      import('./features/guide/guide.component').then(m => m.GuideComponent),
    title: 'Neon Gomoku — How to Play',
  },
  // Default redirect
  { path: '',      redirectTo: 'loading', pathMatch: 'full' },
  // Wildcard fallback
  { path: '**',    redirectTo: 'menu' },
];
