import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { finalize, tap, catchError } from 'rxjs/operators';
import { EventService } from '@common/services/event.service';
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

interface ViewState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class EventStateService {
  private readonly eventsApi = inject(EventService);
  private readonly user = inject(UserService);
  private readonly notification = inject(NzNotificationService);
  readonly message = inject(NzMessageService);
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
  load(): void {
    this.setState({ loading: true, error: null });

    this.eventsApi
      .findAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.setState({
            loading: false,
            error: err?.message ?? 'Failed to load events',
          });
          return throwError(() => err);
        }),
        finalize(() => this.setState({ loading: false }))
      )
      .subscribe({
        next: (events) => this.setState({ data: events, error: null }),
      });
  }

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
          error: err?.message ?? 'Failed to create event',
        });
        return throwError(() => err);
      }),
      finalize(() => this.setState({ loading: false }))
    );
  }

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
          error: err?.message ?? 'Failed to update event',
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
          error: err?.message ?? 'Failed to delete event',
        });
        return throwError(() => err);
      }),
      finalize(() => this.setState({ loading: false }))
    );
  }

  // --- Utilities
  getById(id: string): EventModel | undefined {
    return this.state().data.find((e) => e.id === id);
  }

  // --- Filter Controls
  setSearch(term: string): void {
    this.searchTerm.set(term);
  }

  setVisibility(visibility: PrivacyFilter): void {
    this.visibility.set(visibility);
  }

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

    return request$.pipe(
      tap(() => {
        const action = mode === EventMode.CREATE ? 'created' : 'updated';
        this.notification.success('Success', `Event ${action} successfully!`);
      }),
      catchError((err) => {
        const action = mode === EventMode.CREATE ? 'create' : 'update';
        this.notification.error('Error', `Failed to ${action} event.`);
        this.setState({
          loading: false,
          error: err?.message ?? 'An unknown error occurred',
        });
        return throwError(() => err);
      }),
      finalize(() => this.setState({ loading: false }))
    );
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
