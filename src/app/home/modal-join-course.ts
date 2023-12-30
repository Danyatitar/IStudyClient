import { MyCourseInterface } from './../interfaces/course.interface';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormsModule, Validators, NgModel } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DialogDataJoinCourse } from './home.component';
import { environment } from '../../environments/environments';
import { catchError } from 'rxjs';

@Component({
  selector: 'modal-join-course',
  templateUrl: 'modal-join-course.html',
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
  styleUrl: './home.component.css',
})
export class DialogJoinCourse {
  hasError = false;
  error = '';
  http = inject(HttpClient);
  router = inject(Router);
  apiUrl: string = environment.apiUrl;

  constructor(
    public dialogRef: MatDialogRef<DialogJoinCourse>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataJoinCourse
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    if (!this.data.code) {
      this.hasError = true;
      this.error = 'Field is required';
    } else {
      this.hasError = false;
      this.error = '';
      this.http
        .post<MyCourseInterface>(`${this.apiUrl}/courses/join`, {
          code: this.data.code,
        })
        .pipe(
          catchError((error) => {
            alert(error.error.message);
            return '';
          })
        )
        .subscribe((response: any) => {
          this.dialogRef.close();
          this.router.navigate(['/courses', response._id]);
        });
    }
  }
}
