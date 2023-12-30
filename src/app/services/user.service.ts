import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environments';
import { TeacherOrStudentInterface } from '../interfaces/teacher.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  AuthService = inject(AuthService);
  apiUrl: string = environment.apiUrl;
  currentUser = signal<undefined | null | TeacherOrStudentInterface>(undefined);
  constructor() {}

  async getUser() {}
}
