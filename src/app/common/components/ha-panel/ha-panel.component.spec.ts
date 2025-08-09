import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPanelComponent } from './ha-panel.component';

describe('HaPanelComponent', () => {
  let component: HaPanelComponent;
  let fixture: ComponentFixture<HaPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HaPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
