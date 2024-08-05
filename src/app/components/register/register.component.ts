import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  username: string = '';
  first_name: string = '';
  last_name: string = '';
  password: string = '';
  email: string = '';
  formdeactivated: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    this.formdeactivated = true;
    let data = {
      username: this.username,
      email: this.email,
      password: this.password,
      first_name: this.first_name,
      last_name: this.last_name
    };

    try {
      let resp: any = await this.auth.registerWithUsernameAndPassword(
        this.username,
        this.email,
        this.password,
        this.first_name,
        this.last_name
      );
      console.log(resp.message);
      this.router.navigate(['/login']); // Navigate to /login page after successful registration
    } catch (e) {
      alert('Register failed');
      console.error(e);
      this.resetForm();
    }
  }

  resetForm() {
    this.formdeactivated = false;
    this.username = '';
    this.email = '';
    this.password = '';
  }
}
