import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserInterface } from '../interfaces/user.interface';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  cookies = inject(CookieService);
  authService = inject(AuthService);
  loginForm: FormGroup;
  error: string = '';
  apiUrl: string = environment.apiUrl;

  constructor() {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Field is required';
    }

    if (control?.hasError('email')) {
      return 'Invalid email';
    }

    return '';
  }

  submitForm() {
    if (this.loginForm.valid) {
      this.http
        .post<{ user: UserInterface }>(
          `${this.apiUrl}/auth/login`,
          {
            password: this.loginForm.value.password,
            email: this.loginForm.value.email,
          },
          { withCredentials: true }
        )
        .pipe(
          catchError((error) => {
            this.error = error.error.message;
            return '';
          })
        )
        .subscribe((response: any) => {
          this.error = '';
          this.authService.currentUserSig.set(response.user);
          this.authService.accessToken.set(response.accessToken);
          this.router.navigate(['/home']);
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  toRegister() {
    this.router.navigate(['/register']);
  }
}
