import { Injectable } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class NoticeService {
  constructor(private _message: NzMessageService, private _router: Router) {}

  showInfoMessage(message: string): void {
    this._message.info(message);
  }
  showErrorMessage(message: string): void {
    this._message.create("error", message);
  }
  showSuccessMessage(message: string): void {
    this._message.create("success", message);
  }
  showWarningMessage(message: string): void {
    this._message.create("warning", message);
  }
}
