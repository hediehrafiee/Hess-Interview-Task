export type ValueModel = string | string[] | number | number[] | boolean;
export type ParamsValueModel = Record<string, ValueModel>;

export interface State<T> {
  data?: T;
  loading: boolean;
  error: null;
}

export interface PaginationStateModel {
  first: number;
  items: number;
  last: number;
  next: number | null | undefined;
  pages: number | null | undefined;
  prev: number | null | undefined;
}

export interface ParamsState {
  _page?: number;
  _per_page?: number;
  _sort?: string;
}

export const PaginationConst = {
  first: 1,
  items: 5,
  last: 2,
  next: 2,
};
