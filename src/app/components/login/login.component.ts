import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  formdeactivated: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    this.formdeactivated = true;
    try {
      let resp: any = await this.auth.loginWithUsernameAndPassword(
        this.username,
        this.password
      );
      localStorage.setItem('token', resp.token);
      this.router.navigateByUrl('/board');
    } catch (e) {
      alert('Login failed');
      console.error(e);
      this.resetForm();
    }
  }

  resetForm() {
    this.formdeactivated = false;
    this.username = '';
    this.password = '';
  }
}
