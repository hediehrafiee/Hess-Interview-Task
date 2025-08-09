import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderModel } from '../models/order.model';
import { CreateOrderModel } from '../models/dtos/create-order.model';
import { UpdateOrderModel } from '../models/dtos/update-order.model';
import { CreateOrderWithPersonModel } from '../models/dtos/create-order-with-person.model';
import { CreateOrderWithPurchasesModel } from '../models/dtos/create-order-with-purchases.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  /** Create a new order */
  create(data: CreateOrderModel): Observable<OrderModel> {
    return this._http.post<OrderModel>(`${this.apiUrl}/orders`, data);
  }

  /** Create a new order along with person details */
  createWithPerson(data: CreateOrderWithPersonModel): Observable<OrderModel> {
    return this._http.post<OrderModel>(`${this.apiUrl}/orders/with-person`, data);
  }

  /** Create a new order along with ticket purchases */
  createWithPurchases(data: CreateOrderWithPurchasesModel): Observable<OrderModel> {
    return this._http.post<OrderModel>(`${this.apiUrl}/orders/with-purchases`, data);
  }

  /** Get all orders with optional query parameters */
  findAll(query?: { [key: string]: any }): Observable<OrderModel[]> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<OrderModel[]>(`${this.apiUrl}/orders`, { params });
  }

  /** Get a single order by id */
  findOne(id: string): Observable<OrderModel> {
    return this._http.get<OrderModel>(`${this.apiUrl}/orders/${id}`);
  }

  /** Update an order by id */
  update(id: string, data: UpdateOrderModel): Observable<OrderModel> {
    return this._http.patch<OrderModel>(`${this.apiUrl}/orders/${id}`, data);
  }

  /** Remove an order by id */
  remove(id: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/orders/${id}`);
  }
}
