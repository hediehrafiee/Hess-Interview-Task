import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import translationsEN from "../../public/i18n/en.json";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false
})
export class AppComponent {

  constructor(private _translate: TranslateService) {
    this._translate.setTranslation('en', translationsEN);
    this._translate.setDefaultLang('en');
  }
}
