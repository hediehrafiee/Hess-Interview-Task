import {inject,} from '@angular/core';
import {HttpRequest, HttpInterceptorFn, HttpHandlerFn} from '@angular/common/http';
import {finalize} from 'rxjs/operators';
import {TemplateService} from '../services/template.service';

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const templateService = inject(TemplateService);

  const excludedUrls: string[] = [];

  if (excludedUrls.some((excludedUrl) => req.url.toLowerCase().includes(excludedUrl.toLowerCase()))) {
    return next(req);
  }

  templateService.activeMultipleLoadingCount.update(value => value + 1);
  templateService.showTopProgressBarLoading();

  return next(req).pipe(finalize(() => {
    templateService.activeMultipleLoadingCount.update(value => value - 1);
    templateService.checkActiveMultipleLoading();
  }));
};
