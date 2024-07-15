import { Component, Inject } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-new-device-dialog',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './new-device-dialog.component.html',
})
export class NewDeviceDialogComponent {
  title: string = 'New Device';

  deviceData: {
    name?: string;
    ip?: string;
    userName?: string;
    password?: string;
    autoConnect?: boolean;
  } = {};

  constructor(
    public dialogRef: MatDialogRef<NewDeviceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    Object.assign(this.deviceData, data);

    if (this.data) {
      this.title = 'Edit Device';
    }
  }

  submit() {
    this.dialogRef.close(this.deviceData);
  }

  valid() {
    return (
      this.deviceData.name &&
      this.deviceData.userName &&
      this.deviceData.password
    );
  }
}
