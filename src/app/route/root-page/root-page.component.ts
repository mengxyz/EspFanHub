import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewDeviceDialogComponent } from '../../dialog/new-device-dialog/new-device-dialog.component';
import { ConfirmDialogComponent } from '../../dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './root-page.component.html',
})
export class RootPageComponent implements OnInit {
  devices: Device[] = [];

  constructor(public dialog: MatDialog) {}

  addDevice() {}

  newDevice() {
    const ref = this.dialog.open(NewDeviceDialogComponent, {});
    ref.afterClosed().subscribe((data) => {
      if (data) {
        (data as Device).uid = crypto.randomUUID();
        this.devices.push(data);
        localStorage.setItem('devices', JSON.stringify(this.devices));
        this.reloadDevices();
      }
    });
  }

  ngOnInit(): void {
    this.reloadDevices();
  }

  deleteDevice(id: string) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Device',
        content: 'Would you like to delete this device?',
      },
    });

    ref.afterClosed().subscribe((data) => {
      if (data) {
        this.devices = this.devices.filter((device) => device.uid !== id);
        localStorage.setItem('devices', JSON.stringify(this.devices));
        this.reloadDevices();
      }
    });
  }

  editDevice(id: string) {
    const ref = this.dialog.open(NewDeviceDialogComponent, {
      data: JSON.parse(localStorage.getItem('devices')!).find(
        (device: any) => device.uid === id,
      ),
    });

    ref.afterClosed().subscribe((data) => {
      if (data) {
        const deviceIndex = this.devices.findIndex(
          (device) => device.uid === id,
        );
        this.devices[deviceIndex] = data;
        localStorage.setItem('devices', JSON.stringify(this.devices));
        this.reloadDevices();
      }
    });
  }

  private reloadDevices() {
    this.devices = localStorage.getItem('devices')
      ? JSON.parse(localStorage.getItem('devices')!)
      : [];
  }
}
