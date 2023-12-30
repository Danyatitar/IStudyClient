import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject } from '@angular/core';
import { FormControl, FormsModule, Validators } from '@angular/forms';
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
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { environment } from '../../environments/environments';
import { DialogData } from '../header/header.component';
import { MyCourseInterface } from '../interfaces/course.interface';
import { DialogDataCreateCourse } from './home.component';

@Component({
  selector: 'modal-create-course',
  templateUrl: 'modal-create-course.html',
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
export class DialogCreateCourse {
  hasError = false;
  error = '';
  http = inject(HttpClient);
  router = inject(Router);
  apiUrl: string = environment.apiUrl;

  constructor(
    public dialogRef: MatDialogRef<DialogCreateCourse>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataCreateCourse
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    if (!this.data.course) {
      this.hasError = true;
      this.error = 'Name is required';
    } else if (this.data.course.length < 4) {
      this.hasError = true;
      this.error = 'Min length is 4 symbols';
    } else {
      this.hasError = false;
      this.http
        .post<MyCourseInterface>(`${this.apiUrl}/courses`, {
          name: this.data.course,
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
      this.dialogRef.close(this.data.course);
    }
  }
}
