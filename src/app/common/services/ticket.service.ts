import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TicketModel } from '../models/ticket.model';
import { CreateTicketModel } from '../models/dtos/create-ticket.model';
import { UpdateTicketModel } from '../models/dtos/update-ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  /** Create a new ticket */
  create(data: CreateTicketModel): Observable<TicketModel> {
    return this._http.post<TicketModel>(`${this.apiUrl}/tickets`, data);
  }

  /**
   * Get all tickets. Optional query parameters can be provided
   * for future filtering or pagination support.
   */
  findAll(query?: { [key: string]: any }): Observable<TicketModel[]> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<TicketModel[]>(`${this.apiUrl}/tickets`, { params });
  }

  /** Get a single ticket by its id */
  findOne(id: string): Observable<TicketModel> {
    return this._http.get<TicketModel>(`${this.apiUrl}/tickets/${id}`);
  }

  /** Update a ticket by id */
  update(id: string, data: UpdateTicketModel): Observable<TicketModel> {
    return this._http.patch<TicketModel>(`${this.apiUrl}/tickets/${id}`, data);
  }

  /** Remove a ticket by id */
  remove(id: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/tickets/${id}`);
  }
}
