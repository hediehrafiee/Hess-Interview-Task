export interface UpdateOrderModel {
  orderStatus?: 'Pending' | 'Paid' | 'Denied' | 'Cancelled' | 'Deleted';
  couponCodes?: string[];
  totalPaid?: number;
  totalTax?: number;
  paymentMethod?: string;
  transactionId?: string;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalZip?: string;
  billingCountry?: string;
  ipAddress?: string;
  datePaid?: string;
}
