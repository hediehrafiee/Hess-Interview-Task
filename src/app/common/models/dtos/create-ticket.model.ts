export interface CreateTicketModel {
  eventId: string;
  prefix: string;
  postfix: string;
  ticketName: string;
  price: number;
  currency: string;
  capacity: number;
  primaryImageUrl?: string;
}
