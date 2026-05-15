/**
 * app.config.ts
 * ─────────────────────────────────────────────────────────────
 * Angular 18 application configuration (no NgModule).
 * Sets up:
 *  - Router with lazy loading + browser hash strategy
 *  - Animations (required by router transitions & overlay)
 *  - HTTP client with interceptors
 *  - Zone-based change detection with event coalescing
 */
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideAnimations }   from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';

import { routes }              from './app.routes';
import { loggingInterceptor }  from './core/interceptors/logging.interceptor';
import { errorInterceptor }    from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone-based CD with coalescing for performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router: lazy routes + view transitions API + input binding
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
    ),

    // Angular Animations (required for route transitions & overlays)
    provideAnimations(),

    // HTTP client with functional interceptors
    provideHttpClient(
      withInterceptors([loggingInterceptor, errorInterceptor]),
    ),
  ],
};
