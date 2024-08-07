import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule, PasswordModule, MessagesModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  username: string = '';
  first_name: string = '';
  last_name: string = '';
  password: string = '';
  password2: string = ''
  email: string = '';
  formdisabled: boolean = false;
  public error: string = '';
  messages: Message[] = [];

  constructor(private auth: AuthService, private router: Router, private cd:ChangeDetectorRef) {}


  // ngOnInit() : void {
  //   this.messages = [{ severity: 'error', detail: `Error message` }];
  // }


  async register() {
    this.formdisabled = true;
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
      this.error = "Registration failed. Please try again"
      this.messages = [{ severity: 'error', detail: `${this.error}` }];
      console.error(e);
      this.resetForm();
    }
  }


  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  resetForm() {
    this.formdisabled = false;
    this.username = '';
    this.email = '';
    this.password = '';
  }
}
