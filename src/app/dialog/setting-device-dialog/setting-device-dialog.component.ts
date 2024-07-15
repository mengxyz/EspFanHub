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
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-setting-device-dialog',
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
    MatSelectModule,
  ],
  templateUrl: './setting-device-dialog.component.html',
})
export class SettingDeviceDialogComponent {
  deviceData: {
    name?: string;
    ip?: string;
    userName?: string;
    password?: string;
    autoConnect?: boolean;
    boardSensorAddr?: string;
    fiveVoltSensorAddr?: string;
    twelveVoltSensorAddr?: string;
    useMolexModule?: boolean;
    useOledModule?: boolean;
  } = {};

  boardSensorAddrs: string[] = ['0x44', '0x40'];
  fiveVoltSensorAddrs: string[] = ['0x40', '0x41', '0x42', '0x43', '0x44'];
  twelveVoltSensorAddrs: string[] = ['0x40', '0x41', '0x42', '0x43', '0x44'];

  constructor(
    public dialogRef: MatDialogRef<SettingDeviceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    Object.assign(this.deviceData, data);
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
