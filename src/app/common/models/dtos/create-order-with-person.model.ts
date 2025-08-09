import { CreatePersonModel } from './create-person.model';
import { CreateOrderOnlyModel } from './create-order-only.model';

export interface CreateOrderWithPersonModel {
  person: CreatePersonModel;
  order: CreateOrderOnlyModel;
}
