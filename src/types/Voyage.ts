export type Rating = 1 | 2 | 3 | 4 | 5;

export interface VoyageTypeInfo {
  id: string;
  image_urls: string[];
  title: string;
  notes: string;
  user_id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date: string;
  rating: Rating;
  pins?: { display_name: string; lat: number; lon: number }[];
  comment?: string;
  created_at: string;
  updated_at?: string;
  isFavourite?: boolean;
}
