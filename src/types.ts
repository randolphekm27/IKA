export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "organisateur" | "photographe" | "invite";
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  cover_image: string;
  created_by: string;
  created_at: string;
  date?: string;
  photo_count?: number;
  visit_count?: number;
}

export interface Photo {
  id: string;
  event_id: string;
  image_url: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
  download_count: number;
}

export interface GlobalStats {
  totalEvents: number;
  totalPhotos: number;
  totalDownloads: number;
}
