import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) { }

  create(data: any): Observable<any> {
    return this._http.post(`${this.apiUrl}/organizations`, data);
  }

  setActiveOrganization(organizationId: string): Observable<any> {
    return this._http.patch(`${this.apiUrl}/users/me/active-organization/${organizationId}`, {});
  }

  update(id: string, data: any): Observable<any> {
    return this._http.patch(`${this.apiUrl}/organizations/${id}`, data);
  }

  remove(id: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/organizations/${id}`);
  }

  getMyOrganizations(): Observable<any[]> {
    return this._http.get<any[]>(`${this.apiUrl}/organizations/me`);
  }

  inviteUser(id: string, data: { email: string; role: string }): Observable<any> {
    return this._http.post(`${this.apiUrl}/organizations/${id}/invitations`, data);
  }

  getInvitations(id: string): Observable<any[]> {
    return this._http.get<any[]>(`${this.apiUrl}/organizations/${id}/invitations`);
  }

  acceptInvitation(id: string): Observable<any> {
    return this._http.post(`${this.apiUrl}/organization-invitations/${id}/accept`, {});
  }

  rejectInvitation(id: string): Observable<any> {
    return this._http.post(`${this.apiUrl}/organization-invitations/${id}/reject`, {});
  }

  removeUser(id: string, userId: string, payload: any): Observable<any> {
    return this._http.delete(`${this.apiUrl}/organizations/${id}/users/${userId}`, { body: payload });
  }

  removePerson(id: string, personId: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/organizations/${id}/persons/${personId}`);
  }

  getPersons(id: string, query?: {
    page?: number;
    limit?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Observable<any> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        const value = (query as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this._http.get(`${this.apiUrl}/organizations/${id}/persons`, { params });
  }
}
