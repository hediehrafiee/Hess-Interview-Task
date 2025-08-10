export interface EventModel {
  id?: string;
  title: string;
  organizerId?: string;
  organizer?: { id: string; businessName?: string };
  venueId: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  isPublic?: boolean;
  description?: string;
  primaryImageUrl?: string;
  coverImageUrl?: string;
  imageGalleryUrls?: string[];
}
