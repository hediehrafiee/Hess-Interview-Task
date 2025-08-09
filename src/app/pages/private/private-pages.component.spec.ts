import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivatePagesComponent } from './private-pages.component';

describe('PrivateComponent', () => {
  let component: PrivatePagesComponent;
  let fixture: ComponentFixture<PrivatePagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivatePagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivatePagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
