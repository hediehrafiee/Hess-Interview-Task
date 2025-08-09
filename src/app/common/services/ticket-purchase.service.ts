import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TicketPurchaseModel } from '../models/ticket-purchase.model';
import { CreateTicketPurchaseModel } from '../models/dtos/create-ticket-purchase.model';
import { UpdateTicketPurchaseModel } from '../models/dtos/update-ticket-purchase.model';
import { CreateManyTicketPurchaseModel } from '../models/dtos/create-many-ticket-purchase.model';

@Injectable({
  providedIn: 'root'
})
export class TicketPurchaseService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  /** Create a single ticket purchase */
  create(data: CreateTicketPurchaseModel): Observable<TicketPurchaseModel> {
    return this._http.post<TicketPurchaseModel>(`${this.apiUrl}/ticket-purchases`, data);
  }

  /** Create multiple ticket purchases */
  createMany(data: CreateManyTicketPurchaseModel): Observable<void> {
    return this._http.post<void>(`${this.apiUrl}/ticket-purchases/bulk`, data);
  }

  /** Get all purchases with optional query parameters */
  findAll(query?: { [key: string]: any }): Observable<TicketPurchaseModel[]> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<TicketPurchaseModel[]>(`${this.apiUrl}/ticket-purchases`, { params });
  }

  /** Get a single purchase by id */
  findOne(id: string): Observable<TicketPurchaseModel> {
    return this._http.get<TicketPurchaseModel>(`${this.apiUrl}/ticket-purchases/${id}`);
  }

  /** Update a purchase */
  update(id: string, data: UpdateTicketPurchaseModel): Observable<TicketPurchaseModel> {
    return this._http.patch<TicketPurchaseModel>(`${this.apiUrl}/ticket-purchases/${id}`, data);
  }

  /** Remove a purchase */
  remove(id: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/ticket-purchases/${id}`);
  }

  /** Find purchases by order id */
  findByOrder(orderId: string): Observable<TicketPurchaseModel[]> {
    return this._http.get<TicketPurchaseModel[]>(`${this.apiUrl}/ticket-purchases/order/${orderId}`);
  }

  /** Find purchases by person id */
  findByPerson(personId: string): Observable<TicketPurchaseModel[]> {
    return this._http.get<TicketPurchaseModel[]>(`${this.apiUrl}/ticket-purchases/person/${personId}`);
  }

  /** Find purchases by ticket id */
  findByTicket(ticketId: string): Observable<TicketPurchaseModel[]> {
    return this._http.get<TicketPurchaseModel[]>(`${this.apiUrl}/ticket-purchases/ticket/${ticketId}`);
  }
}
