export interface UpdateCouponModel {
  ticketIds?: string[];
  couponCode?: string;
  discountType?: 'Percentage' | 'Fixed';
  discountAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  isStandalone?: boolean;
}
