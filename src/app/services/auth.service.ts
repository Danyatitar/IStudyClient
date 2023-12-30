import { catchError } from 'rxjs/operators';
import { Injectable, signal, inject } from '@angular/core';
import { UserInterface } from '../interfaces/user.interface';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  apiUrl: string = environment.apiUrl;
  currentUserSig = signal<UserInterface | undefined | null>(undefined);
  accessToken = signal<string | undefined | null>(undefined);

  async isTokenExpired(): Promise<boolean> {
    let expired: boolean = true;

    if (!this.accessToken()) {
      try {
        const response: any = await this.http
          .post(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
          .toPromise();

        this.accessToken.set(response.accessToken);
      } catch (err) {
        expired = true;
      }
    }

    const token = this.accessToken();
    if (token) {
      try {
        let decoded: any = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          try {
            const response: any = await this.http
              .post(
                `${this.apiUrl}/auth/refresh`,
                {},
                { withCredentials: true }
              )
              .toPromise();

            this.accessToken.set(response.accessToken);
            expired = false;
          } catch (err) {
            expired = true;
          }
        } else {
          expired = decoded.exp < Date.now() / 1000;
        }
      } catch (err) {
        expired = true;
      }
    }

    return expired;
  }
}
