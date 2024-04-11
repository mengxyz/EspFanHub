import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FanGuageControlComponent } from '../../fan-guage-control/fan-guage-control.component';
import { Utils } from '../../utils';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { debounce, of, pipe } from 'rxjs';
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    MatButtonModule,
    CommonModule,
    FanGuageControlComponent,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSliderModule,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnDestroy, OnInit {
  private ws: WebSocket | null = null;
  public status: string = '';
  public message = '';
  public isConnected = false;
  public currentStatus: string[] = [];
  public command: string = '';
  public config: FanConfig = {};
  public _showLog: boolean = localStorage.getItem('showLog') === 'true';
  public _showCommand: boolean = localStorage.getItem('showCommand') === 'true';
  public color: string = '';
  public brightness: number = 255;

  device?: Device;

  constructor(
    private activeRoutes: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    try {
      this.device = (<Device[]>(
        JSON.parse(localStorage.getItem('devices')!)
      )).find(
        (device) =>
          device.uid === this.activeRoutes.snapshot.paramMap.get('uid'),
      );
      // this.connect();
    } catch (error) {
      this.router.navigate(['']);
    }
  }

  get showLog(): boolean {
    return this._showLog;
  }

  set showLog(value: boolean) {
    this._showLog = value;
    localStorage.setItem('showLog', value.toString());
  }

  get showCommand(): boolean {
    return this._showCommand;
  }

  set showCommand(value: boolean) {
    this._showCommand = value;
    localStorage.setItem('showCommand', value.toString());
  }

  async connect(): Promise<void> {
    const url = `ws://${this.device?.ip}/ws?token=${btoa(
      `${this.device?.userName}:${this.device?.password}`,
    )}`;
    console.log('Begin Connecting to ', url);
    console.log(
      `User: ${this.device?.userName}, Pass: ${this.device?.password}`,
    );
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.ws = new WebSocket(url);
    this.message = '';
    this.ws.onopen = () => {
      this.status = 'Connected';
      this.isConnected = true;
    };
    this.ws.onclose = () => {
      this.status = 'Disconnected';
      this.isConnected = false;
    };
    this.ws.onmessage = (event) => {
      this.message =
        `${new Date().getHours().toString().padStart(2, '0')}:${new Date()
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${new Date()
          .getSeconds()
          .toString()
          .padStart(2, '0')}: ${event.data}\n` + this.message;
      this.currentStatus = (event.data as string).split(';');
      this.config = { ...Utils.parseConfig(event.data) };
      // console.table(this.config);
    };
    // }
  }

  disconnect(): void {
    this.config = {};
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  send(): void {
    if (this.ws && this.command.trim().length > 0) {
      this.ws.send(this.command.trim());
    }
  }

  sendCommad(command: string): void {
    console.log('Sending Commad: ', command);
    if (this.ws && command.trim().length > 0) {
      this.ws.send(command.trim());
    }
  }

  sendP(event: any, index: number): void {
    // console.log('Sending Commad: ', event, index);
    const cmd = `P${index}:${event.checked ? '1' : '0'}`;
    this.sendCommad(cmd.trim());
    // if (this.ws && command.trim().length > 0) {
    //   this.ws.send(command.trim());
    // }
  }

  log(value: any) {
    console.log(value);
  }

  ngOnDestroy(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  sendC() {
    this.sendCommad(`C:${this.color}`);
  }

  sendB(value: number) {
    if(value <= 10) {
      value = 10
    }
    this.sendCommad(`B:${Math.round(value * 255 / 100)}`);
  }
}
