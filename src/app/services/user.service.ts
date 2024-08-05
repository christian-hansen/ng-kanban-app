import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserUrl = environment.baseUrl + '/current_user/';
  private authToken = 'Token ' + localStorage.getItem('token');

  constructor(private http: HttpClient) {}

  private setHeaders() {
    return new HttpHeaders().set('Authorization', this.authToken);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(this.currentUserUrl, { headers: this.setHeaders() });
  }
}
