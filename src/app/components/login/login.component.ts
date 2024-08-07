import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { CardModule } from 'primeng/card';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    MessagesModule,
    ReactiveFormsModule,
    CardModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  isLoading: boolean = false;
  messages: Message[] = [];
  loginForm = new FormGroup({
    username: new FormControl('', [
      Validators.minLength(2),
      Validators.required,
    ]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  async login() {
    this.isLoading = true;
    let formData = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    try {
      let resp: any = await this.auth.loginWithUsernameAndPassword(
        formData.username!,
        formData.password!
      );
      localStorage.setItem('token', resp.token);
      this.router.navigateByUrl('/board');
    } catch (e: any) {
      this.messages = [
        { severity: 'error', detail: `${e.error.non_field_errors}` },
      ];
      // console.error(e);
      this.resetForm();
    }
  }

  resetForm() {
    this.isLoading = false;
  }
}
