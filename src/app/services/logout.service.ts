import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  constructor(private http: HttpClient) {}

  logout() {
    const logoutUrl = '/api/logout/';

    return this.http
      .get(logoutUrl, { responseType: 'text' as 'json' })
      .pipe(
        catchError((error) => {
          console.error('Logout error:', error);
          return throwError(error);
        })
      );
  }
}
