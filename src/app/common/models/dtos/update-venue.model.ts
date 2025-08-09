export interface UpdateVenueModel {
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  venueName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalZip?: string;
  latitude?: number;
  longitude?: number;
  directions?: string;
  venueType?: string;
  website?: string;
  description?: string;
  logoImageUrl?: string;
  coverImageUrl?: string;
  imageGalleryUrls?: string[];
}
