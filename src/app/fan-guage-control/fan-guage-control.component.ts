import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-fan-guage-control',
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSliderModule,
  ],
  templateUrl: './fan-guage-control.component.html',
  styleUrl: './fan-guage-control.component.scss',
})
export class FanGuageControlComponent {
  private _maxValue = 255;
  @Input() ch!: string | undefined;
  @Input() value!: number | undefined;
  @Input() freq!: number | undefined;
  @Input() current!: number | undefined;
  @Output() valueChange = new EventEmitter<number>();

  public get sliderValue(): number {
    return ((this.value ?? 0) * 100) / this._maxValue;
  }

  public get rpm(): number {
    return ((this.freq ?? 0) / 2) * 60;
  }

  onChange(value: number) {
    this.valueChange.emit(Math.round((this._maxValue * value) / 100));
  }
}
