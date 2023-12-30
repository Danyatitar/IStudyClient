import { TeacherOrStudentInterface } from './../interfaces/teacher.interface';
import { Component, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environments';
import { CourseWithStudents } from '../interfaces/course.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface PeriodicElement {
  student?: TeacherOrStudentInterface;
  name: string;
  position: number;
  email: string;
  id: string;
}

@Component({
  selector: 'app-teacher-students-list',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, CommonModule, MatButtonModule],
  templateUrl: './teacher-students-list.component.html',
  styleUrls: ['./teacher-students-list.component.css'],
})
export class TeacherStudentsListComponent implements OnDestroy {
  http = inject(HttpClient);
  id?: string;
  apiUrl = environment.apiUrl;
  data: PeriodicElement[] = [];
  route = inject(ActivatedRoute);
  displayedColumns: string[] = ['select', 'position', 'name', 'email'];
  dataSource = new MatTableDataSource<PeriodicElement>(this.data);
  selection = new SelectionModel<PeriodicElement>(true, []);
  private routeSubscription: Subscription | undefined;

  constructor() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.id = String(params.get('id'));
      this.http
        .get<CourseWithStudents>(`${this.apiUrl}/courses/${this.id}/students`)
        .subscribe((response) => {
          this.data = response.students.map((item, index) => {
            return {
              position: index + 1,
              name: item.name,
              email: item.email,
              id: item._id,
            };
          });
          this.dataSource = new MatTableDataSource<PeriodicElement>(this.data);
        });
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from subscriptions to avoid memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  deleteSelected() {
    const ids = this.selection.selected.map((item) => item.id);
    this.http
      .patch(`${this.apiUrl}/courses/${this.id}/students`, { students: ids })
      .subscribe((response) => {
        this.data = this.data
          .filter((item) => !ids.includes(item.id))
          .map((item, index) => {
            return { ...item, position: index + 1 };
          });
        this.dataSource = new MatTableDataSource<PeriodicElement>(this.data);
        this.selection.clear();
      });
  }
}
