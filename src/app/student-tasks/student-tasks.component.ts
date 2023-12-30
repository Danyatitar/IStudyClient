import { WorkInterface } from './../interfaces/work.interface';
import { CreateWorkComponent } from './../create-work/create-work.component';
import { ReviewWorksComponent } from './../review-works/review-works.component';
import { TabService } from './../services/tab.service';
import {
  Component,
  inject,
  Input,
  OnInit,
  OnDestroy,
  effect,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environments';
import { TaskInterface } from '../interfaces/task.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { WorkService } from '../services/work.service';

@Component({
  selector: 'app-student-tasks',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    CommonModule,
    MatMenuModule,
    MatIconModule,
  ],
  templateUrl: './student-tasks.component.html',
  styleUrls: ['./student-tasks.component.css'],
})
export class StudentTasksComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  tasks?: TaskInterface[];
  tabService = inject(TabService);
  route = inject(ActivatedRoute);
  routeSubscription: Subscription;
  workService = inject(WorkService);

  taskDone = effect(() => {
    if (this.workService.doneTask()) {
      this.tasks = this.tasks?.map((item) => {
        if (item._id === this.workService.doneTask()?.taskId) {
          return { ...item, work: this.workService.doneTask() };
        }
        return item;
      });
    }
  });

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

    const dateString = date.toLocaleDateString('en-US', options);
    return dateString;
  }

  constructor() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.http
        .get<TaskInterface[]>(
          `${this.apiUrl}/tasks/?courseId=${params.get('id')}`
        )
        .subscribe((response) => {
          this.tasks = response;
          this.tasks = this.tasks?.map((item) => {
            return {
              ...item,
              deadlineDisplay: this.formatDate(item.deadline),
            };
          });
          let taskIds = this.tasks.map((item) => item._id);
          this.http
            .patch<WorkInterface[]>(`${this.apiUrl}/works`, {
              taskIds: taskIds,
            })
            .subscribe((response) => {
              taskIds = [...response].map((item) => item.taskId);
              this.tasks = this.tasks?.map((item) => {
                if (taskIds.includes(item._id)) {
                  const work = response.filter(
                    (item2) => item2.taskId === item._id
                  )[0];
                  return { ...item, work: work };
                }
                return item;
              });
            });
        });
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  openTask(id: string) {
    const task = this.tasks?.filter((item) => item._id === id)[0];
    if (task) {
      this.tabService.createTaskTab.set({
        id: task._id,
        label: `Task: ${task?.name}`,
        component: null,
        studentComponent: CreateWorkComponent,
        task: task,
      });
    }
  }
}
