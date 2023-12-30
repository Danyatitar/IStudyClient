import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DialogData } from '../header/header.component';

@Component({
  selector: 'modal-edit-course',
  templateUrl: 'modal-edit-course.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CommonModule,
  ],
  styleUrl: './home.component.css',
})
export class DialogChangeName {
  hasError = false;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<DialogChangeName>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    if (!this.data.name) {
      this.hasError = true;
      this.error = 'Name is required';
    } else if (this.data.name.length < 4) {
      this.hasError = true;
      this.error = 'Min length is 4 symbols';
    } else {
      this.hasError = false;
      this.dialogRef.close(this.data.name);
    }
  }
}
