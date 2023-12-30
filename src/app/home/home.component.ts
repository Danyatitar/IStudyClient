import { DialogCreateCourse } from './modal-create-course';
import { DialogConfirmatioUnsubscribe } from './modal-confirmation-unsubscribe';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from './../services/user.service';
import { CourseService } from '../services/course.service';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { HeaderComponent } from '../header/header.component';
import {
  MyCourseInterface,
  MyCoursesInterface,
} from '../interfaces/course.interface';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { DialogChangeName } from './modal-edit-course';
import { DialogConfirmationDelete } from './modal-confirmation-delete';
import { DialogJoinCourse } from './modal-join-course';

export interface DialogDataChangeName {
  name: string;
}
export interface DialogDataCreateCourse {
  course: string;
}
export interface DialogDataJoinCourse {
  code: string;
}

export interface DialogDataConfirmation {
  action: 'delete' | '';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, HeaderComponent, CommonModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  name: string = '';
  action: string = '';
  code: string = '';
  course: string = '';
  dialog = inject(MatDialog);
  http = inject(HttpClient);
  apiUrl: string = environment.apiUrl;
  hasStudentCourses = false;
  hasTeacherCourses = false;
  CourseService = inject(CourseService);
  router = inject(Router);
  teacherCourses: MyCourseInterface[] | null | undefined = null;
  studentCourses: MyCourseInterface[] | null | undefined = null;
  UserService = inject(UserService);

  courses = effect(() => {
    if (this.CourseService.myCoursesSig()) {
      this.teacherCourses = this.CourseService.myCoursesSig()?.teacherCourse;
      if (this.teacherCourses?.length) {
        this.hasTeacherCourses = true;
      } else {
        this.hasTeacherCourses = false;
      }
      this.studentCourses = this.CourseService.myCoursesSig()?.studentCourse;
      if (this.studentCourses?.length) {
        this.hasStudentCourses = true;
      } else {
        this.hasStudentCourses = false;
      }
    }
    return this.CourseService.myCoursesSig();
  });

  constructor() {}

  open(id: string) {
    this.router.navigate(['/courses', id]);
  }

  changeName(id: string) {
    const dialogRef = this.dialog.open(DialogChangeName, {
      data: { name: this.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.teacherCourses?.forEach((item) => {
          if (item._id === id) {
            item.name = result;
          }
          return item;
        });
        this.CourseService.myCoursesSig.update((item: any) => {
          return { ...item, teacherCourse: this.teacherCourses };
        });
        this.http
          .patch(`${this.apiUrl}/courses/${id}`, {
            name: result,
          })
          .subscribe((response) => {});
      }
    });
  }

  deleteCourse(id: string) {
    const dialogRef = this.dialog.open(DialogConfirmationDelete, {
      data: { action: this.action },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.teacherCourses = this.teacherCourses?.filter(
          (item) => item._id !== id
        );
        this.CourseService.myCoursesSig.update((item: any) => {
          return { ...item, teacherCourse: this.teacherCourses };
        });

        this.http
          .delete(`${this.apiUrl}/courses/${id}`)
          .subscribe((response) => {});
      }
    });
  }

  unsubscribeFromCourse(id: string) {
    const dialogRef = this.dialog.open(DialogConfirmatioUnsubscribe, {
      data: { action: this.action },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.studentCourses = this.studentCourses?.filter(
          (item) => item._id !== id
        );
        this.CourseService.myCoursesSig.update((item: any) => {
          return { ...item, studentCourse: this.studentCourses };
        });

        this.http
          .delete(`${this.apiUrl}/courses/me/${id}`)
          .subscribe((response) => {});
      }
    });
  }

  joinCourse() {
    const dialogRef = this.dialog.open(DialogJoinCourse, {
      data: { code: this.code },
    });
  }

  createCourse() {
    const dialogRef = this.dialog.open(DialogCreateCourse, {
      data: { course: this.course },
    });
  }
}
