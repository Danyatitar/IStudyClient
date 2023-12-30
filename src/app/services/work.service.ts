import { WorkInterface } from './../interfaces/work.interface';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WorkService {
  doneTask = signal<undefined | WorkInterface>(undefined);
  constructor() {}
}
