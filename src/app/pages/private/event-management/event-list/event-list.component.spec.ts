import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EventModel } from '@common/models/event.model';
import EventListComponent from './event-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { EventStateService } from '@core/services/event/event.state.service';

// --- Mock Dependencies
const mockEventStateService = {
  // We'll mock the events as a computed signal for simplicity in testing
  events: jasmine.createSpy('events').and.returnValue([]),
  loading: signal(false),
  eventDetail: signal<EventModel | null>(null),
  load: jasmine.createSpy('load'),
  remove: jasmine.createSpy('remove').and.returnValue(of(void 0)),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EventListComponent,
        NzCardModule,
        NzButtonModule,
        NzInputModule,
        NzSelectModule,
        NzTableModule,
        NzTagModule,
        NzSpaceModule,
        NzPopconfirmModule,
        NzEmptyModule,
        NzIconModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: EventStateService, useValue: mockEventStateService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    // Reset spies before each test
    mockEventStateService.load.calls.reset();
    mockEventStateService.remove.calls.reset();
    mockRouter.navigate.calls.reset();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call load on the eventState service', () => {.
      expect(mockEventStateService.load).toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('should navigate to the edit page with the given event ID', () => {
      const eventId = 'event-123';
      component.edit(eventId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/p/events',
        eventId,
        'edit',
      ]);
    });

    it('should not navigate if no event ID is provided', () => {
      component.edit(undefined);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should clear the eventDetail signal and navigate to the create page', () => {
      const mockEvent: EventModel = { id: '123' } as EventModel;
      mockEventStateService.eventDetail.set(mockEvent);

      component.create();

      expect(mockEventStateService.eventDetail()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/p/events/new']);
    });
  });

  describe('remove', () => {
    it('should call the remove method on the eventState service with the given ID', () => {
      const eventId = 'event-456';
      component.remove(eventId);
      expect(mockEventStateService.remove).toHaveBeenCalledWith(eventId);
    });

    it('should not call remove if no event ID is provided', () => {
      component.remove(undefined);
      expect(mockEventStateService.remove).not.toHaveBeenCalled();
    });
  });
});
