import { WorkInterface, Mark } from './../interfaces/work.interface';
import { MatInputModule } from '@angular/material/input';
import { File } from './../interfaces/task.interface';
import { TeacherOrStudentInterface } from './../interfaces/teacher.interface';
import { MatButtonModule } from '@angular/material/button';
import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { CommonModule } from '@angular/common';
import { DialogDataEnterMark } from './publications.component';

@Component({
  selector: 'enterMark-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: 'enterMark-modal.html',
  styleUrl: './publications.component.css',
})
export class EnterMarkModal implements OnInit {
  dialog = inject(MatDialog);
  existingFileName?: string;
  http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  student?: TeacherOrStudentInterface;
  description?: string;
  existingFile?: File;
  workId?: string;
  maxMark: number = 0;
  currentMark?: Mark;
  fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    mark: [null, [Validators.required, Validators.max(this.maxMark)]],
  });

  constructor(
    public dialogRef: MatDialogRef<EnterMarkModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataEnterMark
  ) {
    this.student = data.student;
    this.description = data.description;
    this.existingFile = data.fileId;
    this.maxMark = Number(data.maxMark);
    if (data.mark) {
      this.currentMark = data.mark;
      this.form = this.fb.group({
        mark: [
          data.mark.mark,
          [Validators.required, Validators.max(this.maxMark)],
        ],
      });
    } else {
      this.form = this.fb.group({
        mark: [null, [Validators.required, Validators.max(this.maxMark)]],
      });
    }

    this.workId = data.id;
  }

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  download() {
    this.http
      .get(`${this.apiUrl}/works/${this.workId}/download`, {
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe((response) => {
        const contentDispositionHeader = response.headers.get(
          'Content-Disposition'
        );
        const filenameMatch =
          contentDispositionHeader?.match(/filename="?([^"]+)"?/);
        const filename =
          filenameMatch && filenameMatch[1]
            ? filenameMatch[1]
            : 'downloaded-file';

        const blob = response.body;

        if (blob !== null) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          console.error('Received null response body');
        }
      });
  }

  mark() {
    if (this.form.valid) {
      this.http
        .post(`${this.apiUrl}/works/marks/${this.workId}`, {
          mark: this.form.value.mark,
        })
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  update() {
    if (this.form.valid) {
      this.http
        .patch(
          `${this.apiUrl}/works/marks/${this.workId}/?markId=${this.currentMark?._id}`,
          {
            mark: this.form.value.mark,
          }
        )
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  //   updateMark() {
  //     if (this.form.valid) {
  //       this.http
  //         .patch(
  //           `${this.apiUrl}/works/comments/${this.workId}/?commentId=${this.commentId}`,
  //           {
  //             text: this.form.value.text,
  //           }
  //         )
  //         .subscribe((response) => {
  //           this.dialogRef.close(response);
  //         });
  //     } else {
  //       this.form.markAllAsTouched();
  //     }
  // }
}
