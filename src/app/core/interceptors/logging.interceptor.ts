/**
 * logging.interceptor.ts
 * HTTP interceptor — logs requests in development.
 * Extensible: add auth headers, error handling, retry logic here.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.production) {
    console.debug(`[HTTP] ${req.method} ${req.url}`);
  }
  return next(req).pipe(
    tap({
      error: err => {
        if (!environment.production) {
          console.error(`[HTTP Error] ${req.url}`, err);
        }
      },
    })
  );
};
