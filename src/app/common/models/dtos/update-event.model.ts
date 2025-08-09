export interface UpdateEventModel {
  title?: string;
  organizerId?: string;
  venueId?: string;
  startDateTime?: string;
  endDateTime?: string;
  timezone?: string;
  description?: string;
  primaryImageUrl?: string;
  coverImageUrl?: string;
  imageGalleryUrls?: string[];
}
