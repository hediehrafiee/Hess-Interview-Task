export interface UserModel {
  id?: string;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneCountryCode?: string;
  roles?: 'USER' | 'ADMIN' | 'PARTICIPANT';
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalZip?: string;
  accountProfilePhotoUrl?: string;
}
