import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BusinessModel } from '../models/business.model';
import { CreateBusinessModel } from '../models/dtos/create-business.model';
import { UpdateBusinessModel } from '../models/dtos/update-business.model';
import { AddBusinessPersonModel } from '../models/dtos/add-business-person.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  /** Create a new business */
  create(data: CreateBusinessModel): Observable<BusinessModel> {
    return this._http.post<BusinessModel>(`${this.apiUrl}/businesses`, data);
  }

  /**
   * Get all businesses. Optional query parameters can be
   * provided for future filtering or pagination support.
   */
  findAll(query?: { [key: string]: any }): Observable<BusinessModel[]> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<BusinessModel[]>(`${this.apiUrl}/businesses`, { params });
  }

  /** Get a single business by its id */
  findOne(id: string): Observable<BusinessModel> {
    return this._http.get<BusinessModel>(`${this.apiUrl}/businesses/${id}`);
  }

  /** Update a business by id */
  update(id: string, data: UpdateBusinessModel): Observable<BusinessModel> {
    return this._http.patch<BusinessModel>(`${this.apiUrl}/businesses/${id}`, data);
  }

  /** Remove a business by id */
  remove(id: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/businesses/${id}`);
  }

  /** Add a person to a business */
  addPerson(
    businessId: string,
    personId: string,
    data: AddBusinessPersonModel
  ): Observable<void> {
    return this._http.post<void>(
      `${this.apiUrl}/businesses/${businessId}/persons/${personId}`,
      data
    );
  }
}
