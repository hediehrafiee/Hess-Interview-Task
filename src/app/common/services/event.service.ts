import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  /** Create a new event */
  create(data: any): Observable<any> {
    return this._http.post(`${this.apiUrl}/events`, data);
  }

  /**
   * Get all events. Optional query parameters can be provided
   * for future filtering or pagination support.
   */
  findAll(query?: { [key: string]: any }): Observable<any[]> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<any[]>(`${this.apiUrl}/events`, { params });
  }

  /** Get a single event by its id */
  findOne(id: string): Observable<any> {
    return this._http.get(`${this.apiUrl}/events/${id}`);
  }

  /** Update an event by id */
  update(id: string, data: any): Observable<any> {
    return this._http.patch(`${this.apiUrl}/events/${id}`, data);
  }

  /** Remove an event by id */
  remove(id: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/events/${id}`);
  }
}
