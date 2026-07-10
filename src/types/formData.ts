export type FormDataType = {
  title: string;
  image_urls: string[];
  notes: string;
  location: string;
  start_date: string;
  end_date: string;
  rating: number;
  latitude?: number | null;
  longitude?: number | null;
  pins?: {
    place_id?: string;
    display_name: string;
    lat: number;
    lon: number;
    boundingbox?: string[];
  }[];
};
