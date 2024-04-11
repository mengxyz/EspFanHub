import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanGuageControlComponent } from './fan-guage-control.component';

describe('FanGuageControlComponent', () => {
  let component: FanGuageControlComponent;
  let fixture: ComponentFixture<FanGuageControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FanGuageControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FanGuageControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
