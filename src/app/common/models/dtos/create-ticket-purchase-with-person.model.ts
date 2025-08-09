import { CreatePersonModel } from './create-person.model';

export interface CreateTicketPurchaseWithPersonModel {
  ticketId: string;
  amountPaid: number;
  person: CreatePersonModel;
}
