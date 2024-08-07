import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  public loginWithUsernameAndPassword(loginFormData:any) {
    const url = environment.baseUrl + '/login/';
    const body = {
      username: loginFormData.username,
      password: loginFormData.password,
    };
    return lastValueFrom(this.http.post(url, body));
  }

  public registerWithUsernameAndPassword(
    registerFormData:any
  ) {
    const url = environment.baseUrl + '/register/';
    const body = {
      username: registerFormData.username,
      email: registerFormData.email,
      password: registerFormData.password,
      first_name: registerFormData.first_name,
      last_name: registerFormData.last_name,
    };

    return lastValueFrom(this.http.post(url, body));
  }
}
