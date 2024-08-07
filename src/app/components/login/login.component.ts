import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule, PasswordModule, MessagesModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  formdisabled: boolean = false;
  public error: string = '';
  messages: Message[] = [];

  constructor(private auth: AuthService, private router: Router, private cd:ChangeDetectorRef) {}




  async login() {
    this.formdisabled = true;
    console.log("login");
    
    try {
      let resp: any = await this.auth.loginWithUsernameAndPassword(
        this.username,
        this.password
      );
      localStorage.setItem('token', resp.token);
      this.router.navigateByUrl('/board');
    } catch (e) {
      this.error = "Login failed. Please try again"
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
    this.password = '';
  }
}
