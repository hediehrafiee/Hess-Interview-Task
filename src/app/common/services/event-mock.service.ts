import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { EventModel } from '@common/models/event.model';
import { CreateEventModel } from '@common/models/dtos/create-event.model';
import { UpdateEventModel } from '@common/models/dtos/update-event.model';
import { EventQueryModel } from '@common/models/dtos/event-query.model';
import { UserService } from '@core/services/user.service';
import { environment } from '@environment/environment';

/**
 * Handles all mock data logic for events. This service simulates API calls
 * using local storage and a mock data URL, adhering to a single responsibility.
 */
@Injectable({
  providedIn: 'root',
})
export class EventMockService {
  private readonly storageKey = `${environment.localStorageKey}:events`;
  private readonly http = inject(HttpClient);
  readonly #user = inject(UserService);

  /**
   * Reads event data from local storage.
   * It also handles potential legacy data formats and migrates them to the correct format.
   * @returns An array of EventModel objects.
   */
  private readStorage(): EventModel[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed?.events && Array.isArray(parsed.events)) {
        this.writeStorage(parsed.events);
        return parsed.events;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Writes the given event data to local storage.
   * @param events The array of EventModel objects to store.
   */
  private writeStorage(events: EventModel[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(events));
    } catch {
      // Silently ignore storage errors.
    }
  }

  /**
   * Filters an array of events based on the given query model.
   * @param events The array of events to filter.
   * @param query The query model to apply.
   * @returns A filtered array of events.
   */
  private applyQuery(
    events: EventModel[],
    query?: EventQueryModel
  ): EventModel[] {
    if (!query) return events;
    return events.filter((event) =>
      Object.entries(query).every(
        ([key, value]) => value == null || (event as any)[key] === value
      )
    );
  }

  /**
   * Simulates creating a new event.
   * @param data The event creation data.
   * @returns An observable of the newly created event.
   */
  create(data: CreateEventModel): Observable<EventModel> {
    const event: EventModel = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      organizerId: this.#user.user()?.activeOrganizationId,
      ...(data as any),
    } as EventModel;
    const events = this.readStorage();
    events.push(event);
    this.writeStorage(events);
    return of(event);
  }

  /**
   * Simulates fetching all events. It first checks local storage.
   * If empty, it fetches from the mock URL, caches the data, and then returns it.
   * @param query Optional query parameters to filter events.
   * @returns An observable of the event list.
   */
  findAll(query?: EventQueryModel): Observable<EventModel[]> {
    const cached = this.readStorage();
    if (cached.length > 0) {
      return of(this.applyQuery(cached, query));
    }
    return this.http
      .get<{ events: EventModel[] }>(environment.mockDataUrl)
      .pipe(
        map((res) => res?.events ?? []),
        tap((events) => this.writeStorage(events)),
        map((events) => this.applyQuery(events, query))
      );
  }

  /**
   * Simulates finding a single event by its ID.
   * It checks local storage first and falls back to the mock URL if not found.
   * @param id The ID of the event to find.
   * @returns An observable of the event or undefined.
   */
  findOne(id: string): Observable<EventModel | undefined> {
    const fromStore = this.readStorage().find((e) => e.id === id);
    if (fromStore) return of(fromStore);
    return this.http
      .get<{ events: EventModel[] }>(environment.mockDataUrl)
      .pipe(map((res) => res?.events?.find((e) => e.id === id)));
  }

  /**
   * Simulates updating an existing event by ID.
   * @param id The ID of the event to update.
   * @param data The data to update the event with.
   * @returns An observable of the updated event.
   */
  update(id: string, data: UpdateEventModel): Observable<EventModel> {
    const events = this.readStorage();
    const eventIndex = events.findIndex((e) => e.id === id);
    if (eventIndex === -1) {
      return throwError(() => new Error('Event not found.'));
    }
    const updatedEvent = { ...events[eventIndex], ...data, id } as EventModel;
    events[eventIndex] = updatedEvent;
    this.writeStorage(events);
    return of(updatedEvent);
  }

  /**
   * Simulates removing an event by ID.
   * @param id The ID of the event to remove.
   * @returns An observable that completes upon deletion.
   */
  remove(id: string): Observable<void> {
    const events = this.readStorage().filter((e) => e.id !== id);
    this.writeStorage(events);
    return of(void 0);
  }
}
