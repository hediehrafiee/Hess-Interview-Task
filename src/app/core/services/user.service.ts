import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserModel } from '../../common/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl = environment.apiUrl;

  public readonly user: WritableSignal<UserModel | undefined> = signal<UserModel | undefined>(undefined);

  constructor(private _http: HttpClient) { }

  setUser(user: UserModel | undefined): void {
    this.user.set(user);
  }

  /** Fetch current logged in user */
  getCurrentUser(): Observable<UserModel | undefined> {
    return this._http.get<UserModel>(`${this.apiUrl}/users/me`).pipe(
      tap(user => this.setUser(user)),
      catchError(() => of(undefined))
    );
  }

  /** Update a user by id */
  update(id: string, data: Partial<UserModel>): Observable<UserModel> {
    return this._http.patch<UserModel>(`${this.apiUrl}/users/${id}`, data);
  }

}

