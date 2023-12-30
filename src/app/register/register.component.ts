import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { HttpClient } from '@angular/common/http';
import { UserInterface } from '../interfaces/user.interface';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  registrationForm: FormGroup;
  error: string = '';
  apiUrl: string = environment.apiUrl;
  constructor() {
    this.registrationForm = this.fb.nonNullable.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(30),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator.bind(this),
      }
    );
  }

  get name() {
    return this.registrationForm.get('name');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }

  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Field is required';
    }

    if (control?.hasError('email')) {
      return 'Invalid email';
    }

    if (control?.hasError('minlength')) {
      return 'Name must be at least 4 characters.';
    }

    if (control?.hasError('maxlength')) {
      return 'Name must be at most 30 characters.';
    }

    if (control?.hasError('pattern')) {
      return 'Password must include uppercase, lowercase, and numbers, and be at least 8 characters.';
    }

    if (controlName === 'confirmPassword' && control?.hasError('mustMatch')) {
      return 'Passwords must match.';
    }
    return '';
  }

  submitForm() {
    if (this.registrationForm.valid) {
      this.http
        .post<{ user: UserInterface }>(
          `${this.apiUrl}/auth/signup`,
          {
            name: this.registrationForm.value.name,
            password: this.registrationForm.value.password,
            email: this.registrationForm.value.email,
          },
          { withCredentials: true }
        )
        .pipe(
          catchError((error) => {
            alert(error.error.message);

            return '';
          })
        )
        .subscribe((response: any) => {
          this.authService.currentUserSig.set(response.user);
          this.authService.accessToken.set(response.accessToken);
          this.router.navigate(['/home']);
        });
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  toLogIn() {
    this.router.navigate(['/login']);
  }
  private passwordMatchValidator(
    formGroup: AbstractControl
  ): ValidationErrors | null {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (passwordControl?.value !== confirmPasswordControl?.value) {
      confirmPasswordControl?.setErrors({ mustMatch: true });
      return { mustMatch: true };
    } else {
      confirmPasswordControl?.setErrors(null);
      return null;
    }
  }
}
