import {Injectable, signal} from "@angular/core";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Observable, of, tap, catchError, map} from "rxjs";
import {environment} from "../../../environments/environment";
import {NoticeService} from '../../common/services/notice.service';
import {LoginModel} from '../../common/models/dtos/login.model';
import {RegisterModel} from '../../common/models/dtos/register.model';
import {UserService} from './user.service';
import {UserModel} from '../../common/models/user.model';

@Injectable({
  providedIn: "root",
})
export class AuthService {

  public token = signal('');

  private readonly apiUrl = environment.apiUrl;
  private readonly storageKey = environment.localStorageKey;

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _notice: NoticeService,
    private _userService: UserService
  ) {
    const token = localStorage.getItem(`${this.storageKey}_access`);
    if (token) {
      this.token.set(token);
    }
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  register(data: RegisterModel): Observable<any> {
    return this._http.post<any>(`${this.apiUrl}/auth/register`, data);
  }

  login(login: LoginModel): Observable<any | undefined> {
    // return this._http.post<any>(`${this.apiUrl}/auth/login`, login).pipe(
    //   tap(res => {
    //     if (res?.access_token && res?.refresh_token) {
    //       this.storeTokens(res.access_token, res.refresh_token);
    //       this._userService.setUser(res.user);
    //     }
    //   }),
    //   catchError(() => {
    //     this._notice.showErrorMessage('Login failed');
    //     return of(undefined);
    //   })
    // );
    return this._http.get<any>(`https://hessadnani.com/api/mock.json`).pipe(
      tap(res => {
        if (res?.auth?.access_token && res?.auth?.refresh_token) {
          this.storeTokens(res.auth.access_token, res.auth.refresh_token);
          this._userService.setUser(res.user as UserModel);
        }
      }),
      catchError(() => {
        this._notice.showErrorMessage('Login failed');
        return of(undefined);
      })
    );
  }

  logout(navigateToLogin: boolean = true) {
    localStorage.removeItem(`${this.storageKey}_access`);
    localStorage.removeItem(`${this.storageKey}_refresh`);
    this.token.set('');
    this._userService.setUser(undefined);
    if (navigateToLogin) {
      this.navigateToLogin();
    }
  }

  refreshToken(): Observable<string | undefined> {
    const refresh = localStorage.getItem(`${this.storageKey}_refresh`);
    if (!refresh) {
      return of(undefined);
    }
    return this._http.post<any>(`${this.apiUrl}/auth/refresh`, {refresh_token: refresh}).pipe(
      map(res => {
        if (res?.access_token) {
          this.storeTokens(res.access_token, res.refresh_token);
          return res.access_token as string;
        }
        return undefined;
      }),
      catchError(() => of(undefined))
    );
  }


  forgotPassword(email: string): Observable<any> {
    return this._http.post<any>(`${this.apiUrl}/auth/forgot-password`, {email});
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this._http.post<any>(`${this.apiUrl}/auth/reset-password`, { token, password });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this._http.post<any>(`${this.apiUrl}/auth/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  private storeTokens(access: string, refresh?: string): void {
    localStorage.setItem(`${this.storageKey}_access`, access);
    if (refresh) {
      localStorage.setItem(`${this.storageKey}_refresh`, refresh);
    }
    this.token.set(access);
  }

  navigateToLogin() {
    this._router.navigate(['/login'], {
      queryParams: {},
    });
  }
}
