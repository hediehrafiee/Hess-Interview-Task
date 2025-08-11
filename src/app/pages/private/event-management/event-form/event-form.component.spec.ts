import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { EventModel } from '@common/models/event.model';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import EventFormComponent from './event-form.component';
import { EventFormService } from '@core/services/event/event-form.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EventMode } from '@common/Enums/event.enum';
import { EventStateService } from '@core/services/event/event.state.service';

const mockEventFormService = {
  form: new FormBuilder().group({
    title: ['', Validators.required],
    description: [''],
    startDateTime: [new Date(), Validators.required],
    timezone: ['UTC', Validators.required],
    venueId: ['', Validators.required],
    primaryImageUrl: [''],
    coverImageUrl: [''],
    isPublic: [true],
  }),
  patchForm: jasmine.createSpy('patchForm'),
  toPayload: jasmine.createSpy('toPayload'),
  markAllAsTouched: jasmine.createSpy('markAllAsTouched'),
  timeZones: ['UTC', 'Europe/London'],
};

const mockEventStateService = {
  eventDetail: signal<EventModel | null>(null),
  message: {
    warning: jasmine.createSpy('warning'),
  },
  loadOne: jasmine.createSpy('loadOne'),
  submitEvent: jasmine
    .createSpy('submitEvent')
    .and.returnValue(of({} as EventModel)),
  loading: signal(false),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jasmine.createSpy('get'),
    },
  },
};

const mockTranslateService = {
  instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
};

describe('EventFormComponent', () => {
  let component: EventFormComponent;
  let fixture: ComponentFixture<EventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFormComponent, ReactiveFormsModule],
      providers: [
        { provide: EventFormService, useValue: mockEventFormService },
        { provide: EventStateService, useValue: mockEventStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        FormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set mode to CREATE and clear eventDetail if no id is present', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
      mockEventStateService.eventDetail.set({} as EventModel);
      component.ngOnInit();
      expect(component.mode()).toBe(EventMode.CREATE);
      expect(mockEventStateService.eventDetail()).toBeNull();
    });

    it('should call loadOne if id is present', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
      component.ngOnInit();
      expect(component.mode()).toBe(EventMode.CREATE);
      expect(mockEventStateService.loadOne).toHaveBeenCalledWith('123');
    });
  });

  describe('constructor effect', () => {
    it('should patch the form, update mode, and set eventId when eventDetail is set', () => {
      const mockEvent: EventModel = {
        id: '123',
        title: 'Test Event',
        venueId: 'venue-1',
        primaryImageUrl: 'url-1',
        coverImageUrl: 'url-2',
        startDateTime: '2024-01-01T10:00:00Z',
      } as EventModel;

      mockEventStateService.eventDetail.set(mockEvent);
      fixture.detectChanges();

      expect(mockEventFormService.patchForm).toHaveBeenCalledWith(mockEvent);
      expect(component.eventId).toBe('123');
      expect(component.mode()).toBe(EventMode.EDIT);
      expect(component.primaryImageHandler.fileList.length).toBe(1);
      expect(component.coverImageHandler.fileList.length).toBe(1);
    });
  });

  describe('submit', () => {
    it('should submit the form if valid and navigate on success', () => {
      mockEventFormService.form.get('title')?.setValue('Valid Title');
      mockEventFormService.form.get('startDateTime')?.setValue(new Date());

      component.submit();

      expect(mockEventFormService.toPayload).toHaveBeenCalled();
      expect(mockEventStateService.submitEvent).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['p/events']);
    });

    it('should not submit if the form is invalid and show a warning message', () => {
      mockEventFormService.form.get('title')?.setValue('');
      component.submit();

      expect(mockEventFormService.markAllAsTouched).toHaveBeenCalled();
      expect(mockEventStateService.message.warning).toHaveBeenCalledWith(
        'messages.InvalidForm'
      );
      expect(mockEventStateService.submitEvent).not.toHaveBeenCalled();
    });

    it('should handle submission errors gracefully', () => {
      mockEventStateService.submitEvent.and.returnValue(
        throwError(() => new Error('API Error'))
      );
      mockEventFormService.form.get('title')?.setValue('Valid Title');
      mockEventFormService.form.get('startDateTime')?.setValue(new Date());
      component.submit();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should navigate to the event list', () => {
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['p/events']);
    });
  });
});
