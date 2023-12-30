import { WorkInterface } from './../interfaces/work.interface';
import { WorkService } from './../services/work.service';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environments';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TaskInterface } from './../interfaces/task.interface';
import { TabService } from './../services/tab.service';
import { Component, inject, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-create-work',
  standalone: true,
  imports: [
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatCheckboxModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './create-work.component.html',
  styleUrl: './create-work.component.css',
})
export class CreateWorkComponent implements OnInit {
  disabled = false;
  sendDisabled = false;
  cancelDisabled = true;
  publicate = false;
  updateDisabled = true;
  myFile = false;
  missDeadline = false;
  myDescription = '';
  selectedFile?: File;
  updatedFile?: File;
  apiUrl = environment.apiUrl;
  workService = inject(WorkService);
  http = inject(HttpClient);
  filename: string = '';
  mark?: number;
  tabService = inject(TabService);
  task?: TaskInterface = this.tabService.createTaskTab()?.task;

  constructor() {}

  ngOnInit(): void {
    if (this.task) {
      this.task.deadlineDisplay = this.formatDate(this.task?.deadline);
      this.disabled = !this.task.allowPublication;
      this.filename = String(this.task?.work?.fileId?.filename);
      if (this.task.work) {
        this.myFile = true;

        this.publicate = this.task.work.publicate;
        this.disabled = true;
        this.myDescription = this.task.work.description;
        this.sendDisabled = true;
        this.cancelDisabled = false;
      }
      if (this.task.work?.status === 'Marked') {
        this.mark = this.task.work.mark;
        this.cancelDisabled = true;
      }
      if (this.task.work?.status === 'Deleted') {
        this.cancelDisabled = true;
        this.updateDisabled = false;
      }
      if (new Date() > new Date(this.task.deadline)) {
        this.cancelDisabled = true;
        this.updateDisabled = true;
        this.sendDisabled = true;
        this.missDeadline = true;
      }
    }
  }

  formatDate(dateStringInput: string | Date | undefined): string {
    if (dateStringInput) {
      const date = new Date(dateStringInput);

      if (!(date instanceof Date)) {
        throw new Error('Invalid date object');
      }

      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      };

      return date.toLocaleDateString('en-US', options);
    }
    return '';
  }

  handleFileInput(event: any) {
    this.selectedFile = event.files?.[0];
    console.log('File uploaded:', this.selectedFile);
  }
  handleFileUpdate(event: any) {
    this.updatedFile = event.files?.[0];
    console.log('File uploaded:', this.updatedFile);
  }

  download() {
    this.http
      .get(`${this.apiUrl}/tasks/${this.task?._id}/file`, {
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

  downloadMyFile() {
    this.http
      .get(`${this.apiUrl}/works/${this.task?.work?._id}/download`, {
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

  closeTab() {
    this.tabService.closedTab.set(this.task?._id);
  }

  sendWork() {
    const formDataObject = new FormData();
    formDataObject.append('publicate', `${this.publicate}`);
    formDataObject.append('taskId', String(this.task?._id));
    formDataObject.append('description', this.myDescription);
    if (this.selectedFile) {
      formDataObject.append('file', this.selectedFile);
    }
    this.http
      .post<WorkInterface>(`${this.apiUrl}/works`, formDataObject)
      .subscribe((response) => {
        this.workService.doneTask.set(response);
        this.sendDisabled = true;
        this.cancelDisabled = false;
      });
  }

  updateWork() {
    let id;
    if (this.task?.work?._id) {
      id = this.task?.work?._id;
    } else {
      id = this.workService.doneTask()?._id;
    }

    const formDataObject = new FormData();
    formDataObject.append('publicate', `${this.publicate}`);
    formDataObject.append('taskId', String(this.task?._id));
    formDataObject.append('description', this.myDescription);
    console.log(this.updatedFile);
    if (this.updatedFile) {
      formDataObject.append('file', this.updatedFile);
    }

    this.http
      .put<WorkInterface>(`${this.apiUrl}/works/${id}`, formDataObject)
      .subscribe((response) => {
        if (response.fileId) {
          this.filename = response.fileId.filename;
          this.myFile = true;
        }

        this.sendDisabled = true;
        this.updateDisabled = true;
        this.cancelDisabled = false;
      });
  }

  cancel() {
    let id;
    if (this.task?.work?._id) {
      id = this.task?.work?._id;
    } else {
      id = this.workService.doneTask()?._id;
    }
    this.http
      .delete<WorkInterface>(`${this.apiUrl}/works/${id}/decline`)
      .subscribe((response) => {
        console.log(response);

        this.cancelDisabled = true;
        this.updateDisabled = false;
      });
  }
}
