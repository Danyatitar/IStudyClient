import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private AuthService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isTokenExpired = await this.AuthService.isTokenExpired();

    if (isTokenExpired) {
      // Redirect to the login page or handle the authentication logic as needed
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
