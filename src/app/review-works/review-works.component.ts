import { File } from './../interfaces/task.interface';
import { TeacherOrStudentInterface } from './../interfaces/teacher.interface';
import { WorkInterface } from './../interfaces/work.interface';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../environments/environments';
import { TaskInterface } from '../interfaces/task.interface';
import { TabService } from '../services/tab.service';
import { WorkService } from '../services/work.service';
import { MatDialog } from '@angular/material/dialog';
import { ReviewWorkModal } from './review-work-modal';
import { MatRadioModule } from '@angular/material/radio';

export interface DialogDataReviewWork {
  id: string;
  student: TeacherOrStudentInterface;
  maxMark?: number;
  description?: string;
  fileId?: File;
  mark?: number;
}

@Component({
  selector: 'app-review-works',
  standalone: true,
  imports: [
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatCheckboxModule,
    FormsModule,
    MatInputModule,
    MatRadioModule,
  ],
  templateUrl: './review-works.component.html',
  styleUrl: './review-works.component.css',
})
export class ReviewWorksComponent {
  myDescription = '';
  selectedFile?: File;
  apiUrl = environment.apiUrl;
  workService = inject(WorkService);
  http = inject(HttpClient);
  tabService = inject(TabService);
  dialog = inject(MatDialog);
  task?: TaskInterface = this.tabService.createTaskTab()?.task;
  works?: WorkInterface[];
  currentWorks?: WorkInterface[];
  currentStatus: string = 'In Progress';
  values = [
    { value: 'In Progress', label: 'Need to review' },
    { value: 'Marked', label: 'Marked' },
  ];

  constructor() {
    this.http
      .get<WorkInterface[]>(`${this.apiUrl}/works/task/${this.task?._id}`)
      .subscribe((response) => {
        this.works = response.filter((item) => item.status !== 'Deleted');
        this.currentWorks = response.filter(
          (item) => item.status === this.currentStatus
        );
      });
  }

  ngOnInit(): void {
    if (this.task) {
      this.task.deadlineDisplay = this.formatDate(this.task?.deadline);
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

  closeTab() {
    this.tabService.closedTab.set(this.task?._id);
  }

  openModal(id?: string): void {
    const work = this.works?.filter((item) => item._id === id)[0];
    const dialogRef = this.dialog.open(ReviewWorkModal, {
      data: {
        fileId: work?.fileId,
        description: work?.description,
        maxMark: this.task?.maxMark,
        id: work?._id,
        student: work?.studentId,
        mark: work?.mark,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.works = this.works?.map((item) => {
          if (item._id === result._id) {
            return { ...result, status: 'Marked' };
          }
          return item;
        });
        this.currentWorks = this.works?.filter(
          (item) => item.status === result.status
        );
      }
    });
  }
  display(value: any) {
    this.currentWorks = this.works?.filter((item) => item.status === value);
  }
}
