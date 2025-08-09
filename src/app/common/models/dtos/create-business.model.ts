export interface CreateBusinessModel {
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  website?: string;
  businessName?: string;
  registrationNumber?: string;
  vatNumber?: string;
  industry?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalZip?: string;
  logoImageUrl?: string;
  coverImageUrl?: string;
}
