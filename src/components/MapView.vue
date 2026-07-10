<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="location-picker">
    <!-- Search Input -->
    <div v-if="!props.readonly" class="search-container mb-3">
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

    <!-- Selected Location Info (single-pin mode only) -->
    <div
      v-if="!props.readonly && !props.multiple && selectedLocation"
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

    <!-- Pinned Locations (multi-pin mode) -->
    <div
      v-if="!props.readonly && props.multiple"
      class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">
          Pinned Locations ({{ pins.length }}/{{ maxPins }})
        </span>
      </div>

      <p v-if="pins.length === 0" class="text-sm text-gray-500">
        Search or click on the map to pin a location.
      </p>

      <div v-if="atPinLimit" class="text-xs text-orange-600 mb-2">
        Pin limit reached. Remove a pin to add a different one.
      </div>

      <ul v-if="pins.length" class="divide-y">
        <li
          v-for="(pin, i) in pins"
          :key="`${pin.place_id}-${i}`"
          class="flex items-center justify-between py-2"
        >
          <div class="text-sm flex-1 min-w-0">
            <p class="font-medium truncate">{{ pin.display_name }}</p>
            <p class="text-gray-500 text-xs">
              {{ pin.lat.toFixed(4) }}, {{ pin.lon.toFixed(4) }}
            </p>
          </div>
          <button
            type="button"
            @click="removePin(i)"
            class="text-red-600 hover:text-red-700 ml-2 text-xs shrink-0"
          >
            Remove
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
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
  place_id?: string;
  display_name: string;
  lat: number;
  lon: number;
  boundingbox?: string[];
}

interface Props {
  modelValue?: LocationResult | null;
  pins?: LocationResult[];
  multiple?: boolean;
  maxPins?: number;
  mapHeight?: string;
  initialZoom?: number;
  readonly?: boolean; // hides search bar; used on SingleVoyageView
}

const props = withDefaults(defineProps<Props>(), {
  pins: () => [],
  multiple: false,
  maxPins: Infinity,
  mapHeight: "400px",
  initialZoom: 13,
  readonly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: LocationResult | null];
  "update:pins": [value: LocationResult[]];
}>();

// State
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<any | null>(null);
const marker = ref<L.Marker | null>(null);
const searchQuery = ref("");
const searchResults = ref<LocationResult[]>([]);
const selectedLocation = ref<LocationResult | null>(props.modelValue || null);
const isSearching = ref(false);

// Multi-pin state
const pins = ref<LocationResult[]>([...(props.pins || [])]);
const pinMarkers = ref<L.Marker[]>([]);
const atPinLimit = computed(() => pins.value.length >= props.maxPins);

// Debounce timer
let searchTimeout: ReturnType<typeof setTimeout>;

// Initialize map
onMounted(() => {
  if (!mapContainer.value) return;

  const initialPin = props.multiple ? pins.value[0] : selectedLocation.value;

  // Create map centered on a default location
  const defaultCenter: [number, number] = initialPin
    ? [initialPin.lat, initialPin.lon]
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

  // Add click event to map (disabled in readonly mode)
  if (!props.readonly) {
    map.value.on("click", handleMapClick);
  }

  // Render initial marker(s)
  if (props.multiple) {
    pins.value.forEach((pin) => addPinMarker(pin));
  } else if (selectedLocation.value) {
    addMarker(selectedLocation.value.lat, selectedLocation.value.lon);
  }
});

// Clean up
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

// Watch for external changes to modelValue (single-pin mode)
watch(
  () => props.modelValue,
  (newValue) => {
    if (props.multiple) return;
    if (newValue && newValue !== selectedLocation.value) {
      selectedLocation.value = newValue;
      addMarker(newValue.lat, newValue.lon);
      map.value?.setView([newValue.lat, newValue.lon], props.initialZoom);
    }
  }
);

// Watch for external changes to pins (multi-pin mode)
watch(
  () => props.pins,
  (newPins) => {
    if (!props.multiple) return;
    const incoming = newPins || [];
    if (JSON.stringify(incoming) === JSON.stringify(pins.value)) return;
    pins.value = [...incoming];
    clearPinMarkers();
    pins.value.forEach((pin) => addPinMarker(pin));
  },
  { deep: true }
);

// Add or update marker on map (single-pin mode)
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

// Add a marker for a pin (multi-pin mode)
const addPinMarker = (pin: LocationResult) => {
  if (!map.value) return;
  const m = L.marker([pin.lat, pin.lon])
    .bindPopup(pin.display_name)
    .addTo(map.value);
  pinMarkers.value.push(m);
};

const clearPinMarkers = () => {
  pinMarkers.value.forEach((m) => map.value?.removeLayer(m));
  pinMarkers.value = [];
};

// Shared handler for a newly resolved location (map click or search select)
const handleNewLocation = (location: LocationResult) => {
  if (!props.multiple) {
    selectedLocation.value = location;
    emit("update:modelValue", location);
    addMarker(location.lat, location.lon);
    return;
  }

  if (atPinLimit.value) return;

  const wasEmpty = pins.value.length === 0;
  pins.value = [...pins.value, location];
  addPinMarker(location);
  emit("update:pins", pins.value);

  if (wasEmpty) {
    emit("update:modelValue", location);
  }

  map.value?.setView([location.lat, location.lon], props.initialZoom);
};

const removePin = (index: number) => {
  if (index < 0 || index >= pins.value.length) return;

  const removingPrimary = index === 0;
  pins.value = pins.value.filter((_, i) => i !== index);

  const removedMarker = pinMarkers.value[index];
  if (removedMarker) map.value?.removeLayer(removedMarker);
  pinMarkers.value = pinMarkers.value.filter((_, i) => i !== index);

  emit("update:pins", pins.value);

  if (removingPrimary) {
    emit("update:modelValue", pins.value[0] ?? null);
  }
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

    handleNewLocation(location);
  } catch (error) {
    console.error("Error reverse geocoding:", error);

    // Fallback: create basic location object
    const location: LocationResult = {
      place_id: `${lat}-${lng}`,
      display_name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lon: lng,
    };

    handleNewLocation(location);
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
  handleNewLocation(location);
  searchResults.value = [];
  searchQuery.value = props.multiple ? "" : location.display_name;
};

// Clear search
const clearSearch = () => {
  searchQuery.value = "";
  searchResults.value = [];
};

// Clear selection (single-pin mode)
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
