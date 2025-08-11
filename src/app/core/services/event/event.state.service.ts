import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { finalize, tap, catchError } from 'rxjs/operators';
import { UserService } from '@core/services/user.service';
import { EventModel } from '@common/models/event.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UpdateEventModel } from '@common/models/dtos/update-event.model';
import { Observable, of, throwError } from 'rxjs';
import { CreateEventModel } from '@common/models/dtos/create-event.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EventMode, PrivacyFilter } from '@common/Enums/event.enum';
import { SortDirection } from '@common/Enums/base.enum';
import { EventMockService } from '@common/services/event-mock.service';
import { TranslateService } from '@ngx-translate/core';

interface ViewState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/**
 * EventStateService is a central state management service for events.
 * It handles all logic related to fetching, filtering, and mutating event data,
 * providing a single source of truth for the application.
 */
@Injectable({ providedIn: 'root' })
export class EventStateService {
  private readonly eventsApi = inject(EventMockService);
  private readonly user = inject(UserService);
  private readonly notification = inject(NzNotificationService);
  readonly message = inject(NzMessageService);

  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  // --- Core State
  private state = signal<ViewState<EventModel[]>>({
    data: [],
    loading: false,
    error: null,
  });
  eventDetail = signal<EventModel | null>(null);

  // --- Filter State
  searchTerm = signal<string>('');
  visibility = signal<PrivacyFilter>(PrivacyFilter.All);
  sortDirection = signal<SortDirection>(SortDirection.Asc);

  // --- Computed Selectors
  events = computed(() => this.state().data);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  eventById = (id: string) => this.events().find((e) => e.id === id);

  /**
   * A computed signal that filters and sorts the events based on the filter signals.
   * This logic ensures the UI is always up-to-date with the latest filter state.
   */
  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filter = this.visibility();
    const orgId = this.user.user()?.activeOrganizationId;
    const direction = this.sortDirection();

    return this.events()
      .filter((e) =>
        orgId ? e.organizerId === orgId || e.organizer?.id === orgId : true
      )
      .filter((e) =>
        filter === PrivacyFilter.Public
          ? e.isPublic
          : filter === PrivacyFilter.Private
          ? !e.isPublic
          : true
      )
      .filter((e) => e.title.toLowerCase().includes(term))
      .sort((a, b) => {
        const diff =
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime();
        return direction === SortDirection.Asc ? diff : -diff;
      });
  });

  // --- Actions

  /**
   * Loads all events from the API and updates the state.
   * The subscription is handled internally within the service.
   */
  load(): void {
    this.setState({ loading: true, error: null });
    this.eventsApi
      .findAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.setState({
            loading: false,
            error: err?.message ?? this.translate.instant('messages.LoadError'),
          });
          return throwError(() => err);
        }),
        finalize(() => this.setState({ loading: false }))
      )
      .subscribe({
        next: (events) => this.setState({ data: events, error: null }),
      });
  }

  /**
   * Loads a single event by ID and updates the eventDetail signal.
   * The subscription is handled internally.
   * @param id The ID of the event to load.
   */
  loadOne(id: string) {
    this.setState({
      loading: true,
      error: null,
    });
    this.eventsApi.findOne(id).subscribe({
      next: (res) => {
        this.setState({
          loading: false,
          error: null,
        });
        this.eventDetail.set(res || null);
      },
      error: (err) => {
        this.state.set({
          data: [],
          loading: false,
          error: err.message,
        });
      },
    });
  }

  /**
   * Creates a new event.
   * @param data The data for the new event.
   */
  create(data: CreateEventModel): Observable<EventModel> {
    this.setState({ loading: true, error: null });

    return this.eventsApi.create(data).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((event) => {
        // Add to local state immediately
        this.setState((prev) => ({
          data: [...prev.data, event],
          error: null,
        }));
      }),
      catchError((err) => {
        this.setState({
          loading: false,
          error: err?.message ?? this.translate.instant('messages.CreateError'),
        });
        return throwError(() => err);
      }),
      finalize(() => this.setState({ loading: false }))
    );
  }

  /**
   * Updates an existing event.
   * @param id The ID of the event to update.
   * @param data The new data for the event.
   */
  update(id: string, data: UpdateEventModel): Observable<EventModel> {
    this.setState({ loading: true, error: null });

    return this.eventsApi.update(id, data).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((updatedEvent) => {
        // Update local state immediately
        this.setState((prev) => ({
          data: prev.data.map((e) =>
            e.id === id ? { ...e, ...updatedEvent } : e
          ),
          error: null,
        }));
      }),
      catchError((err) => {
        this.setState({
          loading: false,
          error: err?.message ?? this.translate.instant('messages.UpdateError'),
        });
        return throwError(() => err);
      }),
      finalize(() => this.setState({ loading: false }))
    );
  }

  remove(id: string): Observable<void> {
    this.setState({ loading: true, error: null });

    return this.eventsApi.remove(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => {
        // Remove from local state immediately
        this.setState((prev) => ({
          data: prev.data.filter((e) => e.id !== id),
          error: null,
        }));
      }),
      catchError((err) => {
        this.setState({
          loading: false,
          error: err?.message ?? this.translate.instant('messages.DeleteError'),
        });
        return throwError(() => err);
      }),
      finalize(() => this.setState({ loading: false }))
    );
  }

  /**
   * A unified method for handling create and update operations.
   * @param data The event data.
   * @param mode The mode of the operation ('create' or 'edit').
   * @param eventId The ID of the event if in edit mode.
   */
  submitEvent(
    data: CreateEventModel | UpdateEventModel,
    mode: EventMode,
    eventId?: string
  ): Observable<EventModel> {
    this.setState({ loading: true, error: null });

    const request$: Observable<EventModel> =
      mode === EventMode.EDIT && eventId
        ? this.eventsApi.update(eventId, data as UpdateEventModel)
        : this.eventsApi.create(data as CreateEventModel);

    const actionKey = mode === EventMode.CREATE ? 'CreateError' : 'EditError';

    return request$.pipe(
      tap((resultEvent) => {
        this.setState((prev) => {
          const updatedData =
            mode === EventMode.CREATE
              ? [...prev.data, resultEvent]
              : prev.data.map((e) =>
                  e.id === eventId ? { ...e, ...resultEvent } : e
                );
          return { data: updatedData, error: null };
        });

        this.notification.success(
          this.translate.instant('common.Success'),
          this.translate.instant(`messages.${actionKey}`)
        );
      }),
      catchError((err) => {
        this.notification.error(
          this.translate.instant('common.Error'),
          this.translate.instant(`messages.${actionKey}`)
        );
        this.setState({
          loading: false,
          error:
            err?.message ?? this.translate.instant('messages.UnknownError'),
        });
        return throwError(() => err);
      }),
      finalize(() => this.setState({ loading: false }))
    );
  }

  // --- Filter Controls
  toggleSortDirection(): void {
    this.sortDirection.update((current) =>
      current === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc
    );
  }
  resetFilters(): void {
    this.searchTerm.set('');
    this.visibility.set(PrivacyFilter.All);
    this.sortDirection.set(SortDirection.Asc);
  }

  // --- Private Helpers
  private setState(
    updates:
      | Partial<ViewState<EventModel[]>>
      | ((prev: ViewState<EventModel[]>) => Partial<ViewState<EventModel[]>>)
  ): void {
    if (typeof updates === 'function') {
      this.state.update((prev) => ({ ...prev, ...updates(prev) }));
    } else {
      this.state.update((prev) => ({ ...prev, ...updates }));
    }
  }
}
