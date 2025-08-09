import { CreatePersonModel } from './create-person.model';
import { CreateOrderOnlyModel } from './create-order-only.model';
import { CreateTicketPurchaseWithPersonModel } from './create-ticket-purchase-with-person.model';

export interface CreateOrderWithPurchasesModel {
  person: CreatePersonModel;
  order: CreateOrderOnlyModel;
  purchases: CreateTicketPurchaseWithPersonModel[];
}
