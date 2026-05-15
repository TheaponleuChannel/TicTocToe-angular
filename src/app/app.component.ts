/**
 * app.component.ts
 * ─────────────────────────────────────────────────────────────
 * Root shell component. Hosts:
 *  - <router-outlet> for all feature screens
 *  - Layout-level singletons: toast & confetti (always visible)
 *  - Background decoration (stars, scanlines)
 *
 * Keeps the template minimal — all screen logic lives in feature components.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent }    from './layout/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastComponent],
  template: `
    <!-- Background layers (always present) -->
    <div class="app-shell">
      <div class="bg-stars"   aria-hidden="true"></div>
      <div class="scanlines"  aria-hidden="true"></div>

      <!-- Feature screens rendered here by the router -->
      <main class="screen-host" role="main">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Layout-level singletons (outside router flow) -->
    <app-toast></app-toast>`,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
