import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateCouponModel } from '../models/dtos/create-coupon.model';
import { UpdateCouponModel } from '../models/dtos/update-coupon.model';
import { CouponModel } from '../models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  /** Create a new coupon */
  create(data: CreateCouponModel): Observable<CouponModel> {
    return this._http.post<CouponModel>(`${this.apiUrl}/coupons`, data);
  }

  /**
   * Get all coupons with optional query parameters for
   * future filtering or pagination support.
   */
  findAll(query?: { [key: string]: any }): Observable<CouponModel[]> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<CouponModel[]>(`${this.apiUrl}/coupons`, { params });
  }

  /** Get a single coupon by its id */
  findOne(id: string): Observable<CouponModel> {
    return this._http.get<CouponModel>(`${this.apiUrl}/coupons/${id}`);
  }

  /** Update a coupon by id */
  update(id: string, data: UpdateCouponModel): Observable<CouponModel> {
    return this._http.patch<CouponModel>(`${this.apiUrl}/coupons/${id}`, data);
  }

  /** Remove a coupon by id */
  remove(id: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/coupons/${id}`);
  }
}
