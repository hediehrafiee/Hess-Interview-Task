import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PersonModel } from '../models/person.model';
import { CreatePersonModel } from '../models/dtos/create-person.model';
import { UpdatePersonModel } from '../models/dtos/update-person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  /** Create a new person */
  create(data: CreatePersonModel): Observable<PersonModel> {
    return this._http.post<PersonModel>(`${this.apiUrl}/persons`, data);
  }

  /**
   * Get all persons. Optional query parameters can be provided
   * for future filtering or pagination support.
   */
  findAll(query?: { [key: string]: any }): Observable<PersonModel[]> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get<PersonModel[]>(`${this.apiUrl}/persons`, { params });
  }

  /** Get a single person by its id */
  findOne(id: string): Observable<PersonModel> {
    return this._http.get<PersonModel>(`${this.apiUrl}/persons/${id}`);
  }

  /** Update a person by id */
  update(id: string, data: UpdatePersonModel): Observable<PersonModel> {
    return this._http.patch<PersonModel>(`${this.apiUrl}/persons/${id}`, data);
  }

  /** Remove a person by id */
  remove(id: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/persons/${id}`);
  }
}
