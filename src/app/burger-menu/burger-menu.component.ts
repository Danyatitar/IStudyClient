import { MyCoursesInterface } from './../interfaces/course.interface';
import { CourseService } from '../services/course.service';
import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environments';
import {
  MatTreeModule,
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

interface FoodNode {
  name: string;
  _id?: string;
  children?: FoodNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  _id?: string;
}

@Component({
  selector: 'app-burger-menu',
  standalone: true,
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './burger-menu.component.html',
  styleUrl: './burger-menu.component.css',
})
export class BurgerMenuComponent implements OnInit {
  teacherCourses: any = [];
  studentCourses: FoodNode[] = [];
  expandedIndex = 0;
  CourseService = inject(CourseService);
  http = inject(HttpClient);
  router = inject(Router);
  courseService = inject(CourseService);
  isOpen = false;
  apiUrl: string = environment.apiUrl;

  change = effect(() => {
    this.teacherCourses =
      this.courseService.myCoursesSig()?.teacherCourse.map((item) => {
        return { name: item.name, _id: item._id };
      }) ?? [];

    this.studentCourses =
      this.courseService.myCoursesSig()?.studentCourse.map((item) => {
        return { name: item.name, _id: item._id };
      }) ?? [];
    const TREE_DATA: FoodNode[] = [
      {
        name: 'Teacher',
        children: this.teacherCourses,
      },
      {
        name: 'Student',
        children: this.studentCourses,
      },
    ];

    this.dataSource.data = TREE_DATA;
  });

  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      id: node._id,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener<FoodNode, ExampleFlatNode>(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.http
      .get<MyCoursesInterface>(`${this.apiUrl}/courses`)
      .subscribe((response: MyCoursesInterface) => {
        this.courseService.myCoursesSig.set(response);
        this.teacherCourses = response.teacherCourse.map((item) => {
          return { name: item.name, _id: item._id };
        });
        this.studentCourses = response.studentCourse.map((item) => {
          return { name: item.name, _id: item._id };
        });

        const TREE_DATA: FoodNode[] = [
          {
            name: 'Teacher',
            children: this.teacherCourses,
          },
          {
            name: 'Student',
            children: this.studentCourses,
          },
        ];

        this.dataSource.data = TREE_DATA;
      });
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  ngOnInit(): void {}

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  home() {
    this.router.navigate(['/home']);
  }

  toCourse(courseId: string): void {
    this.isOpen = false;
    this.router.navigate(['/courses', courseId]);
  }
}
