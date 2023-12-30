import { ReviewWorksComponent } from './../review-works/review-works.component';
import { MatCardModule } from '@angular/material/card';
import { TaskInterface, File } from './../interfaces/task.interface';
import { CreateTaskModal } from './create-task-modal';
import { MatButtonModule } from '@angular/material/button';
import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabService } from '../services/tab.service';
import { CreateWorkComponent } from '../create-work/create-work.component';

export interface DialogDataCreateTask {
  id: string;
  courseId?: string | null;
  action: 'create' | 'edit';
  name?: string;
  deadline?: Date;
  allowPublicaton?: boolean;
  maxMark?: number;
  description?: string;
  fileId?: File;
}

@Component({
  selector: 'app-teacher-tasks',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    CommonModule,
    MatMenuModule,
    MatIconModule,
  ],
  providers: [MatNativeDateModule, MatDatepickerModule],
  templateUrl: './teacher-tasks.component.html',
  styleUrl: './teacher-tasks.component.css',
})
export class TeacherTasksComponent implements OnInit, OnDestroy {
  courseId?: string;
  http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  tasks?: TaskInterface[];
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  tabService = inject(TabService);
  private routeSubscription: Subscription | undefined;

  constructor() {}
  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.courseId = String(params.get('id'));
      this.fetchTasks();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private fetchTasks(): void {
    if (this.courseId) {
      this.http
        .get<TaskInterface[]>(`${this.apiUrl}/tasks/?courseId=${this.courseId}`)
        .subscribe((response) => {
          this.tasks = response.map((item) => ({
            ...item,
            deadlineDisplay: this.formatDate(item.deadline),
          }));
        });
    }
  }

  formatDate(dateStringInput: string | Date): string {
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

  openModal(): void {
    const dialogRef = this.dialog.open(CreateTaskModal, {
      data: { courseId: this.courseId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.deadlineDisplay = this.formatDate(result.deadline);
        this.tasks?.push(result);
      }
    });
  }

  openTask(id: string): void {
    const task = this.tasks?.filter((item) => item._id === id)[0];
    if (task) {
      this.tabService.createTaskTab.set({
        id: task._id,
        label: `Task: ${task?.name}`,
        component: ReviewWorksComponent,
        studentComponent: null,
        task: task,
      });
    }
  }

  editTask(id: string) {
    const task = this.tasks?.filter((item) => item._id === id)[0];
    const dialogRef = this.dialog.open(CreateTaskModal, {
      data: {
        id: task?._id,
        action: 'edit',
        courseId: this.courseId,
        name: task?.name,
        deadline: task?.deadline,
        allowPublicaton: task?.allowPublication,
        maxMark: task?.maxMark,
        description: task?.description,
        fileId: task?.fileId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.tasks = this.tasks?.map((item) => {
          if (item._id === result._id) {
            return {
              ...result,
              deadlineDisplay: this.formatDate(result.deadline),
            };
          } else return item;
        });
      }
    });
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks?.filter((item) => item._id !== id);
    this.http.delete(`${this.apiUrl}/tasks/${id}`).subscribe((response) => {});
  }
}
