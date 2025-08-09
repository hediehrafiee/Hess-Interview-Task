import { HttpParams } from '@angular/common/http';
import { ParamsValueModel } from '../models/base/base-state.model';

export function queryParamsGenerator(formValue: ParamsValueModel): string {
  if (!Object.values(formValue).length) return '';
  const filteredValue = Object.keys(formValue)
    .filter((key) => formValue[key])
    .reduce((obj: ParamsValueModel, key) => {
      obj[key] = formValue[key];

      return obj;
    }, {});
  const params = new HttpParams({ fromObject: filteredValue });
  return params.toString();
}

export function convertArrayToObject(
  array: any[],
  keyProp: string,
  valueProp?: string
) {
  return array.reduce(
    (rest, item) => ({
      ...rest,
      [item[keyProp]]: valueProp ? item[valueProp] : item,
    }),
    {}
  );
}
