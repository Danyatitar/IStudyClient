import { StandigsComponent } from './../standigs/standigs.component';
import { WorkService } from './../services/work.service';
import { TabService } from './../services/tab.service';
import { StudentStudentsListComponent } from './../student-students-list/student-students-list.component';
import { TeacherStudentsListComponent } from './../teacher-students-list/teacher-students-list.component';
import { environment } from './../../environments/environments';
import {
  MyCourseInterface,
  currentCourse,
  Tab,
} from './../interfaces/course.interface';

import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnInit,
  signal,
  effect,
  OnDestroy,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StudentTasksComponent } from '../student-tasks/student-tasks.component';
import { TeacherTasksComponent } from '../teacher-tasks/teacher-tasks.component';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-course',
  standalone: true,
  imports: [
    HeaderComponent,
    MatButtonToggleModule,
    MatTabsModule,
    CommonModule,
    StudentTasksComponent,
    TeacherTasksComponent,
    TeacherStudentsListComponent,
    StudentStudentsListComponent,
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css',
})
export class CourseComponent implements OnInit, OnDestroy {
  id: string | null = null;
  index?: number = 0;
  apiUrl = environment.apiUrl;
  teacher: boolean | undefined;
  tabService = inject(TabService);
  workService = inject(WorkService);
  code: string | undefined;
  currentCourse: currentCourse | null | undefined;
  private routeSubscription: Subscription | undefined;

  tabCreate = effect(() => {
    if (this.tabService.createTaskTab()) {
      this.addTab(this.tabService.createTaskTab());
    }
  });

  tabClose = effect(() => {
    if (this.tabService.closedTab()) {
      this.deleteTab(this.tabService.closedTab());
    }
  });

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.fetchCourseData();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  fetchCourseData(): void {
    if (this.id) {
      this.http
        .get<currentCourse>(`${this.apiUrl}/courses/${this.id}`)
        .subscribe((response) => {
          this.teacher = response.isTeacher;
          this.code = response.course.code;
          this.currentCourse = response;
          this.currentCourse.tabs = [
            {
              id: '1',
              label: 'Tasks',
              component: TeacherTasksComponent,
              studentComponent: StudentTasksComponent,
            },
            {
              id: '2',
              label: 'Marks',
              component: StandigsComponent,
              studentComponent: null,
            },
            {
              id: '3',
              label: 'Students',
              component: TeacherStudentsListComponent,
              studentComponent: StudentStudentsListComponent,
            },
          ];
        });
    }
  }

  addTab(newTab: Tab | null | undefined): void {
    if (this.currentCourse && newTab) {
      this.currentCourse.tabs?.push(newTab);
      const length = this.currentCourse.tabs?.length;
      if (length) {
        this.index = length - 1;
      }
    }
  }

  deleteTab(id: string | null | undefined): void {
    const tab = this.currentCourse?.tabs?.filter((item) => item.id === id)[0];
    if (tab) {
      const index = this.currentCourse?.tabs?.indexOf(tab);
      if (this.index === Number(this.currentCourse?.tabs?.length) - 1) {
        this.index = Number(this.index) - 1;
      }
      this.currentCourse?.tabs?.splice(Number(index), 1);
    }
  }
}
