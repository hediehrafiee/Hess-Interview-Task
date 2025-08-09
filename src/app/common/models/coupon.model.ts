export interface CouponModel {
  id?: string;
  ticketIds?: string[];
  couponCode: string;
  discountType: 'Percentage' | 'Fixed';
  discountAmount: number;
  expiryDate: string;
  usageLimit?: number;
  isStandalone?: boolean;
}
