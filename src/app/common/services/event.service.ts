import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environment/environment';
import { ApiService } from '@core/services/api.service';
import { EventModel } from '../models/event.model';
import { CreateEventModel } from '../models/dtos/create-event.model';
import { UpdateEventModel } from '../models/dtos/update-event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  #apiService = inject(ApiService);

  /** Create a new event */
  create(data: CreateEventModel): Observable<EventModel> {
    return this._http.post<EventModel>(`${this.apiUrl}/events`, data);
  }

  /**
   * Get all events. Optional query parameters can be provided
   * for future filtering or pagination support.
   */
  findAll(query?: { [key: string]: any }): Observable<EventModel[]> {
    if (environment.mockDataUrl) {
      return this._http.get<any>(environment.mockDataUrl).pipe(
        map((res) => {
          let events = res?.events ?? [];
          if (query) {
            Object.keys(query).forEach((key) => {
              const value = query[key];
              if (value !== undefined && value !== null) {
                events = events.filter((e: any) => e[key] === value);
              }
            });
          }
          return events;
        })
      );
    }

    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<any[]>(`${this.apiUrl}/events`, { params });
  }

  /** Get a single event by its id */
  findOne(id: string): Observable<EventModel | undefined> {
    if (environment.mockDataUrl) {
      return this._http.get<any>(environment.mockDataUrl).pipe(
        map((res) => {
          const events = res?.events ?? [];
          return events.find((e: any) => e.id === id);
        })
      );
    }
    return this._http.get<EventModel>(`${this.apiUrl}/events/${id}`);
  }

  /** Update an event by id */
  update(id: string, data: UpdateEventModel): Observable<EventModel> {
    return this._http.patch<EventModel>(`${this.apiUrl}/events/${id}`, data);
  }

  /** Remove an event by id */
  remove(id: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/events/${id}`);
  }
}
