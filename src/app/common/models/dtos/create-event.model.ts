export interface CreateEventModel {
  title: string;
  venueId: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  description?: string;
  primaryImageUrl?: string;
  coverImageUrl?: string;
  imageGalleryUrls?: string[];
}
