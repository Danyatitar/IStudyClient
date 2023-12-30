import { Tab } from './../interfaces/course.interface';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TabService {
  createTaskTab = signal<undefined | null | Tab>(undefined);
  closedTab = signal<undefined | null | string>(null);
  constructor() {}
}
