import { TaskStandingsInterface } from './../interfaces/task.interface';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environments';
import { TaskInterface } from '../interfaces/task.interface';
import { WorkInterface } from '../interfaces/work.interface';
import { TabService } from '../services/tab.service';
import { WorkService } from '../services/work.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standigs',
  standalone: true,
  imports: [MatTableModule, CommonModule],
  templateUrl: './standigs.component.html',
  styleUrl: './standigs.component.css',
})
export class StandigsComponent implements OnDestroy, OnInit {
  displayedColumns?: string[] = [];
  dataSource: any = [];
  http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  data?: TaskStandingsInterface;
  tabService = inject(TabService);
  route = inject(ActivatedRoute);
  routeSubscription: Subscription;
  workService = inject(WorkService);
  constructor() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.http
        .get<TaskStandingsInterface>(
          `${this.apiUrl}/courses/${params.get('id')}/standings`
        )
        .subscribe((response) => {
          this.data = response;
          this.convertData({ data: this.data, mark: 'mark' });
        });
    });
  }

  convertData({
    data,
    mark,
  }: {
    data?: TaskStandingsInterface;
    mark: 'mark' | 'avgMark';
  }) {
    console.log(data);
    this.displayedColumns = data?.students.map((item) => item.name);
    this.displayedColumns?.unshift('Task');
    data?.data.forEach((item) => {
      const dataSourceItem: any = {};
      dataSourceItem['Task'] = `${item.task}`;
      item.works.forEach((work) => {
        dataSourceItem[work.studentName] = `${work[mark]}/${item.maxMark}`;
      });
      this.dataSource.push(dataSourceItem);
    });

    const dataSourceItem: any = {};
    dataSourceItem['Task'] = `Total`;
    this.displayedColumns?.forEach((column, index) => {
      if (index > 0) {
        let sum = 0;
        let max = 0;
        this.dataSource.forEach((item: any) => {
          sum += Number(item[column].split('/')[0]);
          max += Number(item[column].split('/')[1]);
        });

        dataSourceItem[column] = `${sum}/${max}`;
      }
    });
    this.dataSource.push(dataSourceItem);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
