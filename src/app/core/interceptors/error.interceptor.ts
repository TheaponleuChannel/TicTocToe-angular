/**
 * error.interceptor.ts
 * Global HTTP error handler. Shows toast for server errors.
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg = err.error?.message || err.message || 'An error occurred';
      toast.show(`⚠ ${msg}`, 'error');
      return throwError(() => err);
    })
  );
};
