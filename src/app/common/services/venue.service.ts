import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VenueModel } from '../models/venue.model';
import { CreateVenueModel } from '../models/dtos/create-venue.model';
import { UpdateVenueModel } from '../models/dtos/update-venue.model';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  /** Create a new venue */
  create(data: CreateVenueModel): Observable<VenueModel> {
    return this._http.post<VenueModel>(`${this.apiUrl}/venues`, data);
  }

  /**
   * Get all venues. Optional query parameters can be provided
   * for future filtering or pagination support.
   */
  findAll(query?: { [key: string]: any }): Observable<VenueModel[]> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<VenueModel[]>(`${this.apiUrl}/venues`, { params });
  }

  /** Get a single venue by its id */
  findOne(id: string): Observable<VenueModel> {
    return this._http.get<VenueModel>(`${this.apiUrl}/venues/${id}`);
  }

  /** Update a venue by id */
  update(id: string, data: UpdateVenueModel): Observable<VenueModel> {
    return this._http.patch<VenueModel>(`${this.apiUrl}/venues/${id}`, data);
  }

  /** Remove a venue by id */
  remove(id: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/venues/${id}`);
  }
}
