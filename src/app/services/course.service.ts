import { AuthService } from './auth.service';
import { MyCoursesInterface } from '../interfaces/course.interface';
import { Injectable, signal, inject } from '@angular/core';
import { UserInterface } from '../interfaces/user.interface';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  http = inject(HttpClient);
  AuthService = inject(AuthService);
  apiUrl: string = environment.apiUrl;
  myCoursesSig = signal<MyCoursesInterface | undefined | null>(undefined);
  constructor() {}
}
