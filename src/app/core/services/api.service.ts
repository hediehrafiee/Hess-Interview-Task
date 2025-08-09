import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';
import { ParamsValueModel } from '@common/models/base/base-state.model';
import { queryParamsGenerator } from '@common/utilities/query-params-generator';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  apiBasePath = environment.apiUrl;

  get<T>(url: string, params?: ParamsValueModel): Observable<T> {
    const queryParams = queryParamsGenerator(params ?? {});
    return this.http.get<T>(
      `${this.apiBasePath}${url}${queryParams ? '?' + queryParams : ''}`
    );
  }

  post<T, D>(url: string, data?: D): Observable<T> {
    return this.http.post<T>(`${this.apiBasePath}${url}`, data);
  }

  put<T, D>(url: string, data: D): Observable<T> {
    return this.http.put<T>(`${this.apiBasePath}${url}`, data);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.apiBasePath}${url}`);
  }
}
