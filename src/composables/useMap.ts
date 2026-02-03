import mapboxgl from "mapbox-gl";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
  created_at?: string;
}

export class MapboxService {
  private map: mapboxgl.Map | null = null;
  private supabase: SupabaseClient;
  private markers: mapboxgl.Marker[] = [];

  constructor(
    private mapboxToken: string,
    supabaseUrl: string,
    supabaseKey: string
  ) {
    mapboxgl.accessToken = mapboxToken;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  initializeMap(
    container: HTMLDivElement,
    options?: mapboxgl.MapboxOptions
  ): mapboxgl.Map {
    this.map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.5, 40],
      zoom: 9,
      ...options,
    });

    // Add controls
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.FullscreenControl());
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserLocation: true,
      })
    );

    return this.map;
  }

  async loadLocationsFromSupabase(
    tableName: string = "locations"
  ): Promise<MapLocation[]> {
    try {
      const { data: locations, error } = await this.supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (locations) {
        this.addMarkers(locations as MapLocation[]);
        return locations as MapLocation[];
      }

      return [];
    } catch (error) {
      console.error("Error loading locations:", error);
      throw error;
    }
  }

  async addLocationToSupabase(
    location: Omit<MapLocation, "id" | "created_at">,
    tableName: string = "locations"
  ): Promise<MapLocation> {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .insert([location])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        this.addMarker(data as MapLocation);
      }

      return data as MapLocation;
    } catch (error) {
      console.error("Error adding location:", error);
      throw error;
    }
  }

  addMarkers(locations: MapLocation[]): void {
    if (!this.map) return;

    locations.forEach((location) => {
      this.addMarker(location);
    });
  }

  addMarker(location: MapLocation): void {
    if (!this.map) return;

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      this.createPopupHTML(location)
    );

    const marker = new mapboxgl.Marker({
      color: this.getMarkerColor(location.category),
    })
      .setLngLat([location.longitude, location.latitude])
      .setPopup(popup)
      .addTo(this.map);

    this.markers.push(marker);
  }

  clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  private createPopupHTML(location: MapLocation): string {
    return `
      <div class="p-2 min-w-[200px]">
        <h3 class="font-bold text-lg mb-1">${location.name}</h3>
        ${
          location.description
            ? `<p class="text-gray-700 mb-2">${location.description}</p>`
            : ""
        }
        ${
          location.category
            ? `<span class="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">${location.category}</span>`
            : ""
        }
        <p class="text-sm text-gray-500 mt-2">
          Coordinates: ${location.latitude.toFixed(
            4
          )}, ${location.longitude.toFixed(4)}
        </p>
      </div>
    `;
  }

  private getMarkerColor(category?: string): string {
    const colors: Record<string, string> = {
      hotel: "#3B82F6",
      restaurant: "#10B981",
      attraction: "#F59E0B",
      default: "#EF4444",
    };

    return category ? colors[category] || colors.default : colors.default;
  }

  // Add GeoJSON layer from Supabase
  async addGeoJSONLayer(
    tableName: string,
    layerId: string,
    sourceId: string
  ): Promise<void> {
    if (!this.map) return;

    try {
      // Query Supabase for GeoJSON data
      const { data, error } = await this.supabase.from(tableName).select("*");

      if (error) throw error;

      // Convert to GeoJSON format
      const geoJSON: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: data.map((item: unknown) => {
          const loc = item as MapLocation;
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [loc.longitude, loc.latitude],
            },
            properties: {
              id: loc.id,
              name: loc.name,
              description: loc.description,
              category: loc.category,
            },
          };
        }),
      };

      // Add source and layer to map
      this.map.addSource(sourceId, {
        type: "geojson",
        data: geoJSON,
      });

      this.map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 8,
          "circle-color": "#3B82F6",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
        },
      });

      // Add click event
      this.map.on("click", layerId, (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const coordinates = (
            feature.geometry as GeoJSON.Point
          ).coordinates.slice() as [number, number];
          const description = feature.properties?.description || "";

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <h3 class="font-bold">${feature.properties?.name}</h3>
              <p>${description}</p>
            `
            )
            .addTo(this.map!);
        }
      });
    } catch (error) {
      console.error("Error adding GeoJSON layer:", error);
    }
  }
}
