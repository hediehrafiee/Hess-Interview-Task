import {NgModule} from "@angular/core";
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from "@angular/platform-browser";
import {APP_ROUTES} from "./app.routes";
import {AppComponent} from "./app.component";
import {provideNzI18n} from "ng-zorro-antd/i18n";
import {en_US} from "ng-zorro-antd/i18n";
import {registerLocaleData} from "@angular/common";
import en from "@angular/common/locales/en";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {PreloadAllModules, RouterModule} from "@angular/router";
import {MissingTranslationHandler, TranslateModule} from "@ngx-translate/core";
import {NzModalService} from "ng-zorro-antd/modal";
import {IconDefinition} from '@ant-design/icons-angular';
import {provideNzIcons} from 'ng-zorro-antd/icon';
import * as AllIcons from '@ant-design/icons-angular/icons';
import {MyMissingTranslationHandler} from './core/handlers/missing-translation.handler';
import {loadingInterceptor} from './core/interceptors/loader.interceptor';
import {AuthService} from './core/services/auth.service';
import {UserService} from './core/services/user.service';

registerLocaleData(en);

const antDesignIcons = AllIcons as Record<string, IconDefinition>;
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key])

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      defaultLanguage: "en",
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler,
      },
    }),
    RouterModule.forRoot(APP_ROUTES, {preloadingStrategy: PreloadAllModules}),
  ],
  providers: [
    NzModalService,
    provideNzIcons(icons),
    provideClientHydration(withEventReplay()),
    provideNzI18n(en_US),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([loadingInterceptor]), withFetch()),
    AuthService,
    UserService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
