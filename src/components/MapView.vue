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
          <div class="font-medium">{{ result.display_name }}</div>
          <div class="text-xs text-gray-500">
            {{ result.lat.toFixed(4) }}, {{ result.lon.toFixed(4) }}
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
            {{ selectedLocation.display_name }}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            Coordinates: {{ selectedLocation.lat.toFixed(4) }},
            {{ selectedLocation.lon.toFixed(4) }}
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
let searchTimeout: NodeJS.Timeout;

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

    selectedLocation.value = location;
    emit("update:modelValue", location);
    addMarker(lat, lng);
  } catch (error) {
    console.error("Error reverse geocoding:", error);

    // Fallback: create basic location object
    const location: LocationResult = {
      place_id: `${lat}-${lng}`,
      display_name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lon: lng,
    };

    selectedLocation.value = location;
    emit("update:modelValue", location);
    addMarker(lat, lng);
  }
};

// Search for location
const searchLocation = async () => {
  if (!searchQuery.value.trim() || searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;

  try {
    // Using Nominatim (OpenStreetMap's geocoding service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery.value
      )}&limit=5`
    );

    const data = await response.json();

    searchResults.value = data.map((item: any) => ({
      place_id: item.place_id,
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      boundingbox: item.boundingbox,
    }));
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

// Select location from search results
const selectLocation = (location: LocationResult) => {
  selectedLocation.value = location;
  emit("update:modelValue", location);
  searchResults.value = [];
  searchQuery.value = location.display_name;
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
