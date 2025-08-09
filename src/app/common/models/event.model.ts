export interface EventModel {
  id?: string;
  title: string;
  organizerId?: string;
  venueId: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  description?: string;
  primaryImageUrl?: string;
  coverImageUrl?: string;
  imageGalleryUrls?: string[];
}
