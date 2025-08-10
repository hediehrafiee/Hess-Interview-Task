import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs/operators';
import { EventService } from '@common/services/event.service';
import { UserService } from '@core/services/user.service';
import { EventModel } from '@common/models/event.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export enum PrivacyFilter {
  All = 'all',
  Public = 'public',
  Private = 'private',
}
export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

interface ViewState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class EventStateService {
  private readonly eventsApi = inject(EventService);
  private readonly user = inject(UserService);

  // --- state
  private state = signal<ViewState<EventModel[]>>({
    data: [],
    loading: false,
    error: null,
  });

  private destroyRef = inject(DestroyRef);

  // --- selectors
  events = computed(() => this.state().data);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  searchTerm = signal<string>('');
  visibility = signal<PrivacyFilter>(PrivacyFilter.All);
  sortDirection = signal<SortDirection>(SortDirection.Asc);

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

  load(): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));
    this.eventsApi
      .findAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.state.update((s) => ({ ...s, loading: false })))
      )
      .subscribe({
        next: (events) => this.state.update((s) => ({ ...s, data: events })),
        error: (err) =>
          this.state.update((s) => ({
            ...s,
            error: err?.message ?? 'Load failed',
          })),
      });
  }

  remove(id: string): void {
    this.state.update((s) => ({ ...s, loading: true }));
    this.eventsApi
      .remove(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.state.update((s) => ({ ...s, loading: false })))
      )
      .subscribe({
        next: () =>
          this.state.update((s) => ({
            ...s,
            data: s.data.filter((e) => e.id !== id),
          })),
        error: (err) =>
          this.state.update((s) => ({
            ...s,
            error: err?.message ?? 'Delete failed',
          })),
      });
  }

  // helpers
  setSearch(term: string) {
    this.searchTerm.set(term);
  }
  setVisibility(v: PrivacyFilter) {
    this.visibility.set(v);
  }

  toggleSortDirection() {
    this.sortDirection.update((dir) =>
      SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc
    );
  }
  reset() {
    this.searchTerm.set('');
    this.visibility.set(PrivacyFilter.All);
    this.sortDirection.set(SortDirection.Asc);
  }
}
