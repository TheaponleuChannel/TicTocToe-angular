/**
 * main.ts — Application entry point
 * Bootstraps the standalone AppComponent with appConfig providers.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig }    from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error('[Bootstrap Error]', err));
