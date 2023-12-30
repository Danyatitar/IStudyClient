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
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  NativeDateAdapter,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogDataCreateTask } from './teacher-tasks.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'create-task-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: 'create-task-modal.html',
  styleUrl: './teacher-tasks.component.css',
})
export class CreateTaskModal implements OnInit {
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);
  editModal?: boolean;
  existingFileName?: string;
  http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  minDate: Date = new Date();
  selectedFile?: File;

  modalForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(4)]],
    deadlineDate: ['', [Validators.required]],
    deadlineTime: ['', [Validators.required]],
    maxMark: ['', [Validators.required, Validators.min(1)]],
    description: [''],
    allowPublication: [false],
  });

  constructor(
    public dialogRef: MatDialogRef<CreateTaskModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataCreateTask
  ) {
    this.editModal = data.action === 'edit';
    if (this.editModal) {
      this.modalForm.get('name')?.setValue(data.name);
      this.modalForm.get('maxMark')?.setValue(data.maxMark);
      this.modalForm.get('description')?.setValue(data.description);
      this.modalForm.get('allowPublication')?.setValue(data.allowPublicaton);
      this.modalForm.get('deadlineDate')?.setValue(data.deadline);
      const date = new Date(String(data.deadline));
      let currentTime = '';
      if (date.getHours() < 10) {
        currentTime += '0';
      }
      currentTime += date.getHours() + ':';
      if (date.getMinutes() < 10) {
        currentTime += '0';
      }
      currentTime += date.getMinutes();
      this.modalForm.get('deadlineTime')?.setValue(currentTime);
      this.existingFileName = data.fileId?.filename;
    }
  }

  ngOnInit(): void {
    const currentDate = new Date();
    this.minDate.setDate(currentDate.getDate() + 1);
  }

  handleFileInput(event: any) {
    this.selectedFile = event.files?.[0];
    console.log('File uploaded:', this.selectedFile);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.modalForm.valid) {
      const timeComponents = this.modalForm.value.deadlineTime.split(':');
      this.modalForm.value.deadlineDate.setHours(timeComponents[0]);
      this.modalForm.value.deadlineDate.setMinutes(timeComponents[1]);

      const formDataObject = new FormData();
      formDataObject.append('name', this.modalForm.value.name);
      formDataObject.append('deadline', this.modalForm.value.deadlineDate);
      formDataObject.append('description', this.modalForm.value.description);
      formDataObject.append('maxMark', this.modalForm.value.maxMark);
      if (this.selectedFile) {
        formDataObject.append('file', this.selectedFile);
      }

      formDataObject.append('courseId', String(this.data.courseId));
      formDataObject.append(
        'allowPublication',
        this.modalForm.value.allowPublication
      );

      this.http
        .post(`${this.apiUrl}/tasks`, formDataObject)
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    } else {
      this.modalForm.markAllAsTouched();
    }
  }

  download() {
    this.http
      .get(`${this.apiUrl}/tasks/${this.data.id}/file`, {
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

  updateTask() {
    if (this.modalForm.valid) {
      const deadline = new Date(this.modalForm.value.deadlineDate);
      const timeComponents = this.modalForm.value.deadlineTime.split(':');
      deadline.setHours(timeComponents[0]);
      deadline.setMinutes(timeComponents[1]);
      const formDataObject = new FormData();
      formDataObject.append('name', this.modalForm.value.name);
      formDataObject.append('deadline', String(deadline));
      formDataObject.append('description', this.modalForm.value.description);
      formDataObject.append('maxMark', this.modalForm.value.maxMark);
      if (this.selectedFile) {
        formDataObject.append('file', this.selectedFile);
      }

      formDataObject.append('courseId', String(this.data.courseId));
      formDataObject.append(
        'allowPublication',
        this.modalForm.value.allowPublication
      );

      this.http
        .put(`${this.apiUrl}/tasks/${this.data.id}`, formDataObject)
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    } else {
      this.modalForm.markAllAsTouched();
    }
  }
}
