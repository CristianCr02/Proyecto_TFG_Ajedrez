import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(
    withInterceptors([interceptor])
  )]
};

      
export function interceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (req.url.includes(environment.API_URL)) {
    return next(req);
  }
  const token = localStorage.getItem('token') ?? '';
  const reqWithHeader = req.clone({
    headers: req.headers.set('Authorization', token)
  });
  return next(reqWithHeader);
}

    