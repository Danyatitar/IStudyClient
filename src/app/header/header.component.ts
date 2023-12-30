import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from './../services/user.service';
import { CourseService } from '../services/course.service';
import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BurgerMenuComponent } from '../burger-menu/burger-menu.component';
import { MyCoursesInterface } from '../interfaces/course.interface';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { TeacherOrStudentInterface } from '../interfaces/teacher.interface';
import { environment } from '../../environments/environments';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

export interface DialogData {
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatCardModule,
    BurgerMenuComponent,
    MatButtonModule,
    MatMenuModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  name: string = '';

  dialog = inject(MatDialog);
  http = inject(HttpClient);
  apiUrl: string = environment.apiUrl;
  CourseService = inject(CourseService);
  AuthService = inject(AuthService);
  router = inject(Router);
  courses: MyCoursesInterface | null | undefined = null;
  UserService = inject(UserService);
  userName: string | null | undefined = '';

  constructor() {
    if (!this.UserService.currentUser()) {
      this.http
        .get<TeacherOrStudentInterface>(`${this.apiUrl}/users`)
        .subscribe((response) => {
          this.UserService.currentUser.set(response);
          this.userName = response.name;
        });
    } else {
      this.userName = this.UserService.currentUser()?.name;
    }
    this.courses = this.CourseService.myCoursesSig();
  }

  logOut() {
    this.http.post(`${this.apiUrl}/auth/logout`, {});
    this.router.navigate(['login']);
    this.CourseService.myCoursesSig.set(null);
    this.AuthService.accessToken.set('');
  }

  changeName() {
    const dialogRef = this.dialog.open(Dialog, {
      data: { name: this.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userName = result;
        this.http
          .patch<TeacherOrStudentInterface>(`${this.apiUrl}/users`, {
            name: this.userName,
          })
          .subscribe((response) => {
            this.UserService.currentUser.set(response);
          });
      }
    });
  }
}

@Component({
  selector: 'modal-header',
  templateUrl: 'modal-header.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CommonModule,
  ],
  styleUrl: './header.component.css',
})
export class Dialog {
  hasError = false;
  error = '';
  constructor(
    public dialogRef: MatDialogRef<Dialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    if (!this.data.name) {
      this.hasError = true;
      this.error = 'Name is required';
    } else if (this.data.name.length < 4) {
      this.hasError = true;
      this.error = 'Min length is 4 symbols';
    } else {
      this.hasError = false;
      this.dialogRef.close(this.data.name);
    }
  }
}
