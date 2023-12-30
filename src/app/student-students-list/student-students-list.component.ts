import { PublicationsComponent } from './../publications/publications.component';
import { TabService } from './../services/tab.service';
import { Component, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environments';
import { CourseWithStudents } from '../interfaces/course.interface';
import { PeriodicElement } from '../teacher-students-list/teacher-students-list.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-student-students-list',
  standalone: true,
  imports: [MatTableModule, CommonModule, MatButtonModule],
  templateUrl: './student-students-list.component.html',
  styleUrls: ['./student-students-list.component.css'],
})
export class StudentStudentsListComponent implements OnDestroy {
  http = inject(HttpClient);
  id?: string;
  apiUrl = environment.apiUrl;
  data: PeriodicElement[] = [];
  route = inject(ActivatedRoute);
  displayedColumns: string[] = ['position', 'name', 'btn'];
  dataSource = new MatTableDataSource(this.data);
  private routeSubscription: Subscription | undefined;
  tabService = inject(TabService);

  constructor() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.id = String(params.get('id'));
      this.http
        .get<CourseWithStudents>(`${this.apiUrl}/courses/${this.id}/students`)
        .subscribe((response) => {
          this.data = response.students.map((item, index) => {
            return {
              student: item,
              position: index + 1,
              name: item.name,
              email: item.email,
              id: item._id,
            };
          });
          this.dataSource.data = this.data;
        });
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from subscriptions to avoid memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  view(id: string) {
    const user = this.data.filter((item) => item.id === id)[0];
    if (user) {
      this.tabService.createTaskTab.set({
        id: user.id,
        label: `User: ${user.name}`,
        component: null,
        studentComponent: PublicationsComponent,
        student: user.student,
      });
    }
  }
}
