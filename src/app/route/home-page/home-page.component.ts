import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderDragEvent, MatSliderModule } from '@angular/material/slider';
import { debounce, of, pipe } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { SettingDeviceDialogComponent } from '../../dialog/setting-device-dialog/setting-device-dialog.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    MatButtonModule,
    CommonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatCardModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    MatSelectModule,
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

  public readonly emptyDuty: number[] = Array.from({ length: 5 }, () => 0);
  public readonly emptyRpm: number[] = Array.from({ length: 5 }, () => 0);

  device?: Device;

  testData: number = 10;

  port: any | undefined = undefined;
  reader: any | undefined = undefined;

  selectedArgbMode: number = 0;
  argbSpeed: number = 10;
  readonly MAX_ARGB_SPEED: number = 65535;
  readonly MAX_ARGB_BRIGHTNESS: number = 255;

  skipUpdate: boolean = false;

  argbMode: Record<string, number> = {
    STATIC: 0,
    BLINK: 1,
    BREATH: 2,
    COLOR_WIPE: 3,
    COLOR_WIPE_INV: 4,
    COLOR_WIPE_REV: 5,
    COLOR_WIPE_REV_INV: 6,
    COLOR_WIPE_RANDOM: 7,
    RANDOM_COLOR: 8,
    SINGLE_DYNAMIC: 9,
    MULTI_DYNAMIC: 10,
    RAINBOW: 11,
    RAINBOW_CYCLE: 12,
    SCAN: 13,
    DUAL_SCAN: 14,
    FADE: 15,
    THEATER_CHASE: 16,
    THEATER_CHASE_RAINBOW: 17,
    RUNNING_LIGHTS: 18,
    TWINKLE: 19,
    TWINKLE_RANDOM: 20,
    TWINKLE_FADE: 21,
    TWINKLE_FADE_RANDOM: 22,
    SPARKLE: 23,
    FLASH_SPARKLE: 24,
    HYPER_SPARKLE: 25,
    STROBE: 26,
    STROBE_RAINBOW: 27,
    MULTI_STROBE: 28,
    BLINK_RAINBOW: 29,
    CHASE_WHITE: 30,
    CHASE_COLOR: 31,
    CHASE_RANDOM: 32,
    CHASE_RAINBOW: 33,
    CHASE_FLASH: 34,
    CHASE_FLASH_RANDOM: 35,
    CHASE_RAINBOW_WHITE: 36,
    CHASE_BLACKOUT: 37,
    CHASE_BLACKOUT_RAINBOW: 38,
    COLOR_SWEEP_RANDOM: 39,
    RUNNING_COLOR: 40,
    RUNNING_RED_BLUE: 41,
    RUNNING_RANDOM: 42,
    LARSON_SCANNER: 43,
    COMET: 44,
    FIREWORKS: 45,
    FIREWORKS_RANDOM: 46,
    MERRY_CHRISTMAS: 47,
    FIRE_FLICKER: 48,
    FIRE_FLICKER_SOFT: 49,
    FIRE_FLICKER_INTENSE: 50,
    CIRCUS_COMBUSTUS: 51,
    HALLOWEEN: 52,
    BICOLOR_CHASE: 53,
    TRICOLOR_CHASE: 54,
    TWINKLEFOX: 55,
    RAIN: 56,
  };

  data: Data = {
    boardTemp: {
      temp: 0,
      humi: 0,
    },
    thermistor: {
      ch0Adc: 0,
      ch0Voltage: 0,
      ch0Temp: 0,
      ch1Adc: 0,
      ch1Voltage: 0,
      ch1Temp: 0,
    },
    voltage: {
      twelveVolt: {
        current: 0,
        voltage: 0,
        power: 0,
      },
      fiveVolt: {
        current: 0,
        voltage: 0,
        power: 0,
      },
    },
    fanSource: Array.from({ length: 5 }, () => 0),
    argbSource: 0,
    fanData: {
      freqs: Array.from({ length: 5 }, () => 0),
      duties: Array.from({ length: 5 }, () => 0),
      rpms: Array.from({ length: 5 }, () => 0),
    },
  };

  isReading: boolean = false;

  constructor(
    private activeRoutes: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}

  async closePort() {
    this.isReading = false;

    if (this.reader) {
      await this.reader.cancel();
      this.reader.releaseLock();
    }

    if (this.port) {
      await this.port.close();
      console.log('Port closed');
      this.port = undefined;
    }
  }

  async openPort() {
    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      if (this.port.readable) {
        this.reader = this.port.readable.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        this.isReading = true;

        try {
          while (this.isReading) {
            const { value, done } = await this.reader.read();
            if (done) {
              console.log('Stream reading done');
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            let lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (let line of lines) {
              console.log(`=> ${line.trim()}`);
            }
          }
        } catch (error) {
          console.error('Error while reading from the stream:', error);
        } finally {
          this.reader.releaseLock();
        }
      }
    } catch (error) {
      console.error('Error opening the serial port:', error);
    }
  }

  ngOnInit(): void {
    try {
      this.device = (<Device[]>(
        JSON.parse(localStorage.getItem('devices')!)
      )).find(
        (device) =>
          device.uid === this.activeRoutes.snapshot.paramMap.get('uid'),
      );
      if(this.device?.autoConnect) {
        this.connect();
      }
    } catch (error) {
      this.router.navigate(['']);
    }

    console.log(this.data);

    (navigator as any).serial.addEventListener('connect', (e: any) => {
      console.log(e);
    });

    (navigator as any).serial.addEventListener('disconnect', (e: any) => {
      console.log(e);
    });
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
          .padStart(2, '0')}: \n ${JSON.stringify(JSON.parse(event.data), null, 4)}\n` + this.message;
      // this.message =
      //   `${new Date().getHours().toString().padStart(2, '0')}:${new Date()
      //     .getMinutes()
      //     .toString()
      //     .padStart(2, '0')}:${new Date()
      //     .getSeconds()
      //     .toString()
      //     .padStart(2, '0')}: ${event.data}\n` + this.message;
      if (!this.skipUpdate) {
        this.data = JSON.parse(event.data);
      }
    };
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

  openSettingDialog() {
    const dialogRef = this.dialog.open(SettingDeviceDialogComponent, {
      data: {
        device: this.device,
      },
    });
  }

  log(value: any) {
    console.log(value);
  }

  ngOnDestroy(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  async setArgbMode() {
    this.skipUpdate = true;
    try {
      const result = await fetch(`http://${this.device?.ip}/mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          color: this.color.substring(1),
          mode: this.selectedArgbMode,
          speed: Math.round((this.argbSpeed * this.MAX_ARGB_SPEED) / 100),
          brightness: Math.round(
            (this.brightness * this.MAX_ARGB_BRIGHTNESS) / 100,
          ),
        }),
      });
      console.log(`ARGB RESULT => ${result.status}`);
    } catch (error) {
      console.log(error);
    } finally {
      this.skipUpdate = false;
    }
  }

  async loadArgb() {
    try {
      const result = await fetch(`http://${this.device?.ip}/mode`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const content = await result.json();
      this.selectedArgbMode = content.mode;
      this.argbSpeed = Math.round((content.speed * 100) / this.MAX_ARGB_SPEED);
      this.brightness = Math.round(
        (content.brightness * 100) / this.MAX_ARGB_BRIGHTNESS,
      );
    } catch (error) {
      console.log(error);
    }
  }

  sendC() {
    this.sendCommad(`C:${this.color}`);
  }

  sendB(value: number) {
    if (value <= 10) {
      value = 10;
    }
    this.sendCommad(`B:${Math.round((value * 255) / 100)}`);
  }

  formatLabel(value: number): string {
    return `${value}`;
  }

  async toggleFanSource(ch: number) {
    this.skipUpdate = true;
    try {
      await fetch(`http://${this.device?.ip}/fan-source`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ch: ch,
          source: this.data.fanSource[ch],
        }),
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.skipUpdate = false;
    }
  }

  async toggleArgbSource() {
    this.skipUpdate = true;
    try {
      await fetch(`http://${this.device?.ip}/argb-source`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: this.data.argbSource,
        }),
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.skipUpdate = false;
    }
  }

  async setDuty(event: MatSliderDragEvent, ch: number) {
    this.skipUpdate = true;
    try {
      await fetch(`http://${this.device?.ip}/fan-duty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ch: ch,
          duty: event.value,
        }),
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.skipUpdate = false;
    }
  }
}
