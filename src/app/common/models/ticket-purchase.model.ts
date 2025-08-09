export interface TicketPurchaseModel {
  id?: string;
  ticketId: string;
  personId: string;
  orderId: string;
  amountPaid: number;
}
