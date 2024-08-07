import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('Token');
    const csrfToken = this.getCookie('csrftoken');

    let headers = request.headers;

    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }

    if (csrfToken) {
      headers = headers.set('X-CSRFToken', csrfToken);
    }

    request = request.clone({ headers });

    //pipe starts when "request" is finished
    return next.handle(request).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            //redirect user to the login page / logged out page
            this.router.navigateByUrl('/login');
          }
        }
        return throwError(() => err);
      })
    );
  }

  // Function to retrieve the value of a specified cookie from the browser's cookie storage by searching through the document.cookie string
  private getCookie(name: string): string | null {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
}
