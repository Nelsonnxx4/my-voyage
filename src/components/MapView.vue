<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="location-picker">
    <!-- Search Input -->
    <div class="search-container mb-3">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          @input="debouncedSearch"
          @keydown.enter.prevent="searchNow"
          placeholder="Search for a location..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent50 focus:border-transparent"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <!-- Search Results Dropdown -->
      <div
        v-if="searchResults.length > 0"
        class="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <button
          v-for="result in searchResults"
          :key="result.place_id"
          @click="selectLocation(result)"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
        >
          <div class="font-medium">{{ shortName(result) }}</div>
          <div class="text-xs text-gray-500 truncate">
            {{ result.display_name }}
          </div>
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div
      ref="mapContainer"
      class="map-container rounded-lg overflow-hidden border border-gray-300"
      :style="{ height: mapHeight }"
    ></div>

    <!-- Selected Location Info -->
    <div
      v-if="selectedLocation"
      class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <p class="font-medium text-gray-900">
            {{ shortName(selectedLocation) }}
          </p>
          <p class="text-sm text-gray-500 mt-0.5 truncate">
            {{ selectedLocation.display_name }}
          </p>
        </div>
        <button
          @click="clearSelection"
          class="text-red-600 hover:text-red-700 ml-2"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationResult {
  place_id: string;
  display_name: string;
  short_name?: string; // city + country e.g. "London, United Kingdom"
  lat: number;
  lon: number;
  boundingbox?: string[];
}

interface Props {
  modelValue?: LocationResult | null;
  mapHeight?: string;
  initialZoom?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mapHeight: "400px",
  initialZoom: 13,
});

const emit = defineEmits<{
  "update:modelValue": [value: LocationResult | null];
}>();

// State
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const marker = ref<L.Marker | null>(null);
const searchQuery = ref("");
const searchResults = ref<LocationResult[]>([]);
const selectedLocation = ref<LocationResult | null>(props.modelValue || null);
const isSearching = ref(false);

// Debounce timer
let searchTimeout: ReturnType<typeof setTimeout>;

// Extract a concise "City, Country" from Nominatim display_name
const shortName = (location: LocationResult): string => {
  const parts = location.display_name.split(",").map((s) => s.trim());
  if (parts.length === 1) return parts[0];
  // First part is usually the city/place, last part is the country
  const city = parts[0];
  const country = parts[parts.length - 1];
  return city === country ? city : `${city}, ${country}`;
};

// Initialize map
onMounted(() => {
  if (!mapContainer.value) return;

  // Create map centered on a default location
  const defaultCenter: [number, number] = selectedLocation.value
    ? [selectedLocation.value.lat, selectedLocation.value.lon]
    : [51.505, -0.09]; // London as default

  map.value = L.map(mapContainer.value).setView(
    defaultCenter,
    props.initialZoom
  );

  // Add OpenStreetMap tiles (free alternative to Mapbox)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map.value);

  // Add click event to map
  map.value.on("click", handleMapClick);

  // If there's an initial location, add a marker
  if (selectedLocation.value) {
    addMarker(selectedLocation.value.lat, selectedLocation.value.lon);
  }
});

// Clean up
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== selectedLocation.value) {
      selectedLocation.value = newValue;
      addMarker(newValue.lat, newValue.lon);
      map.value?.setView([newValue.lat, newValue.lon], props.initialZoom);
    }
  }
);

// Add or update marker on map
const addMarker = (lat: number, lon: number) => {
  if (!map.value) return;

  // Remove existing marker
  if (marker.value) {
    map.value.removeLayer(marker.value);
  }

  // Add new marker
  marker.value = L.marker([lat, lon]).addTo(map.value);

  // Center map on marker
  map.value.setView([lat, lon], props.initialZoom);
};

// Handle map click
const handleMapClick = async (e: L.LeafletMouseEvent) => {
  const { lat, lng } = e.latlng;

  // Reverse geocode to get location name
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();

    const location: LocationResult = {
      place_id: data.place_id,
      display_name: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
    };
    location.short_name = shortName(location);

    selectedLocation.value = location;
    emit("update:modelValue", location);
    addMarker(lat, lng);
  } catch (error) {
    console.error("Error reverse geocoding:", error);

    // Fallback: create basic location object
    const location: LocationResult = {
      place_id: `${lat}-${lng}`,
      display_name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      short_name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lon: lng,
    };

    selectedLocation.value = location;
    emit("update:modelValue", location);
    addMarker(lat, lng);
  }
};

// Search for location using Photon (CORS-friendly, OSM-based, no API key needed)
const searchLocation = async () => {
  if (!searchQuery.value.trim() || searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(
        searchQuery.value
      )}&limit=5&lang=en`
    );

    const data = await response.json();

    searchResults.value = (data.features ?? []).map((feature: any) => {
      const p = feature.properties;
      const [lon, lat] = feature.geometry.coordinates;

      // Build display name from Photon's structured properties
      const parts = [p.name, p.city || p.county, p.state, p.country]
        .filter(Boolean)
        .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i);

      const display_name = parts.join(", ");
      const short_name = [p.name || p.city, p.country]
        .filter(Boolean)
        .join(", ");

      return {
        place_id: `${lat}-${lon}`,
        display_name,
        short_name,
        lat,
        lon,
      };
    });
  } catch (error) {
    console.error("Error searching location:", error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

// Debounced search
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(searchLocation, 500);
};

// Immediate search triggered by pressing Enter – auto-selects top result
const searchNow = async () => {
  clearTimeout(searchTimeout);
  await searchLocation();
  if (searchResults.value.length > 0) {
    selectLocation(searchResults.value[0]);
  }
};

// Select location from search results
const selectLocation = (location: LocationResult) => {
  // Photon results already have short_name; for map-click results use shortName()
  const enriched = {
    ...location,
    short_name: location.short_name || shortName(location),
  };
  selectedLocation.value = enriched;
  emit("update:modelValue", enriched);
  searchResults.value = [];
  searchQuery.value = enriched.short_name ?? enriched.display_name;
  addMarker(location.lat, location.lon);
};

// Clear search
const clearSearch = () => {
  searchQuery.value = "";
  searchResults.value = [];
};

// Clear selection
const clearSelection = () => {
  selectedLocation.value = null;
  emit("update:modelValue", null);

  if (marker.value && map.value) {
    map.value.removeLayer(marker.value);
    marker.value = null;
  }
};
</script>

<style scoped>
.location-picker {
  position: relative;
}

.search-container {
  position: relative;
  z-index: 10;
}

.map-container {
  width: 100%;
  min-height: 300px;
}

/* Override Leaflet default styles */
:deep(.leaflet-container) {
  font-family: inherit;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}
</style>
