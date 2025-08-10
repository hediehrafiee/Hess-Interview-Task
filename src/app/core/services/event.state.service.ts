import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { EventService } from '@common/services/event.service';
import { UserService } from '@core/services/user.service';
import { EventModel } from '@common/models/event.model';

export type PrivacyFilter = 'all' | 'public' | 'private';

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

  // --- selectors
  events = computed(() => this.state().data);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  searchTerm = signal<string>('');
  visibility = signal<PrivacyFilter>('all');

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filter = this.visibility();
    const orgId = this.user.user()?.activeOrganizationId;

    return this.events()
      .filter((e) =>
        orgId ? e.organizerId === orgId || e.organizer?.id === orgId : true
      )
      .filter((e) =>
        filter === 'public'
          ? e.isPublic
          : filter === 'private'
          ? !e.isPublic
          : true
      )
      .filter((e) => e.title.toLowerCase().includes(term))
      .sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime()
      );
  });

  load(): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));
    this.eventsApi
      .findAll()
      .pipe(
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
  reset() {
    this.searchTerm.set('');
    this.visibility.set('all');
  }
}
