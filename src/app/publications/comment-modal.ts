import { WorkInterface } from './../interfaces/work.interface';
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
import { DialogDataCreateComment } from './publications.component';

@Component({
  selector: 'comment-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: 'comment-modal.html',
  styleUrl: './publications.component.css',
})
export class CommentModal implements OnInit {
  isEdit?: boolean;
  commentId?: string;
  dialog = inject(MatDialog);
  http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  student?: TeacherOrStudentInterface;
  title?: string = '';
  workId?: string;
  fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    text: [null, Validators.required],
  });

  constructor(
    public dialogRef: MatDialogRef<CommentModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataCreateComment
  ) {
    this.student = data.student;
    this.workId = data.workId;
    this.title = data.title;
    this.isEdit = data.action === 'edit';
    this.commentId = data.commentId;
    if (data.text) {
      this.form = this.fb.group({
        text: [data.text, Validators.required],
      });
    } else {
      this.form = this.fb.group({
        text: [null, Validators.required],
      });
    }
  }

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  create() {
    if (this.form.valid) {
      this.http
        .post(`${this.apiUrl}/works/comments/${this.workId}`, {
          text: this.form.value.text,
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
          `${this.apiUrl}/works/comments/${this.workId}/?commentId=${this.commentId}`,
          {
            text: this.form.value.text,
          }
        )
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
