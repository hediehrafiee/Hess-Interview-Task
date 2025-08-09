import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: "root",
})
export class InitializeService {
  constructor() {
  }

  initializeApp(): Observable<string> {
    return of('');
  }
}
