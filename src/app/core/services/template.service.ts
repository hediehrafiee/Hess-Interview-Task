import {Injectable, signal, WritableSignal} from '@angular/core';
import {Router} from "@angular/router";
import {NoticeService} from "../../common/services/notice.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  // Loaders
  public readonly globalLoading: WritableSignal<boolean> = signal(false);
  public readonly topProgressBarLoading: WritableSignal<boolean> = signal(false);
  public readonly activeMultipleLoadingCount: WritableSignal<number> = signal(0);


  constructor(private _router: Router, private _notice: NoticeService, private _translate: TranslateService) {
  }

  showGlobalLoading(): void {
    setTimeout(()=>{
      this.globalLoading.set(true);
    });
  }
  hideGlobalLoading(): void {
    setTimeout(()=> {
      this.globalLoading.set(false);
    });
  }
  showTopProgressBarLoading(): void {
    setTimeout(()=> {
      this.topProgressBarLoading.set(true);
    });
  }
  hideTopProgressBarLoading(): void {
    setTimeout(()=> {
      this.topProgressBarLoading.set(false);
    });
  }
  checkActiveMultipleLoading(): void {
    if (this.activeMultipleLoadingCount() === 0) {
      setTimeout(()=> {this.hideTopProgressBarLoading()}, 1000)
    }
  }
  refreshPlatform(toItself: boolean, urlToNavigateTo?: string): void {
    let url= (toItself ? this._router.url : urlToNavigateTo) as string;
    this._router.navigateByUrl('/p/not-found', { skipLocationChange: true }).then(()=>{
      this._router.navigateByUrl(url);
    })
  }
}
