import { ApplicationConfig, importProvidersFrom, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { AuthInterceptorService } from './services/auth-interceptor.service';

export const HttpInterceptorProvider: Provider =
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withFetch()), importProvidersFrom(HttpClientModule), HttpInterceptorProvider, provideAnimations()]
};
