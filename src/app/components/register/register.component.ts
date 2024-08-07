import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule, PasswordModule, MessagesModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  username: string = '';
  first_name: string = '';
  last_name: string = '';
  password: string = '';
  password_repeat: string = ''
  email: string = '';
  formdisabled: boolean = false;
  public error: string = '';
  messages: Message[] = [];

  regForm = new FormGroup({
    username: new FormControl('', [Validators.minLength(2), Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    first_name: new FormControl('', [Validators.minLength(2),Validators.required]),
    last_name: new FormControl('', [Validators.minLength(2), Validators.required]),
    password: new FormControl('', [Validators.required]),
    password_repeat: new FormControl('', [Validators.required]),
  });

  constructor(private auth: AuthService, private router: Router, private cd:ChangeDetectorRef) {}

  async register() {
    this.formdisabled = true;
    let formData = {
      username: this.regForm.value.username,
      email: this.regForm.value.email,
      password: this.regForm.value.password,
      first_name: this.regForm.value.first_name,
      last_name: this.regForm.value.last_name
    };

    if (this.isPassWordsMatching()) {

      try {        
        let resp: any = await this.auth.registerWithUsernameAndPassword(
          formData.username!,
          formData.email!,
          formData.password!,
          formData.first_name!,
          formData.last_name!
        );
        // console.log(resp.message);
        this.router.navigate(['/login']); // Navigate to /login page after successful registration
      } catch (e: any) {
        this.messages = [{ severity: 'error', detail: `${e.error.error}` }];
        console.error(e);
        this.resetForm();
      }
    } else {
      this.messages = [{ severity: 'error', detail: `Passwords are not matching` }];
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

  isPassWordsMatching(): boolean {
    return this.regForm.value.password === this.regForm.value.password_repeat
  }

}
