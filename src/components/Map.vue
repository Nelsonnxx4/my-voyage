<template>
  <main>
    <div ref="mapContainer" class="map-container"></div>
  </main>
</template>

<script lang="ts">
export default { name: "MapDisplay" };
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Types
interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

// Props
const props = defineProps<{
  mapboxToken: string;
  supabaseUrl: string;
  supabaseKey: string;
  initialLocation?: {
    latitude: number;
    longitude: number;
    zoom?: number;
  };
}>();

// Refs
const mapContainer = ref<HTMLDivElement>();
const map = ref<mapboxgl.Map>();
const supabase = ref<SupabaseClient>();

supabase.value = createClient(props.supabaseUrl, props.supabaseKey);

onMounted(async () => {
  if (!mapContainer.value || !props.mapboxToken) return;

  mapboxgl.accessToken = props.mapboxToken;

  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/streets-v12",
    center: props.initialLocation
      ? [props.initialLocation.longitude, props.initialLocation.latitude]
      : [-74.5, 40], // Default to NYC
    zoom: props.initialLocation?.zoom || 9,
  });

  // Add navigation controls
  map.value.addControl(new mapboxgl.NavigationControl());

  // Load data from Supabase when map loads
  map.value.on("load", async () => {
    await loadLocationsFromSupabase();
  });
});

// Load locations from Supabase
async function loadLocationsFromSupabase() {
  if (!supabase.value) return;

  try {
    const { data: locations, error } = await supabase.value
      .from("locations") // Your table name
      .select("*");

    if (error) throw error;

    if (locations) {
      addMarkersToMap(locations as LocationData[]);
    }
  } catch (error) {
    console.error("Error loading locations:", error);
  }
}

// Add markers to map
function addMarkersToMap(locations: LocationData[]) {
  if (!map.value) return;

  locations.forEach((location) => {
    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <h3 class="font-bold">${location.name}</h3>
          ${location.description ? `<p>${location.description}</p>` : ""}
          <p class="text-sm text-gray-600">
            Lat: ${location.latitude.toFixed(
              4
            )}, Lng: ${location.longitude.toFixed(4)}
          </p>
        `);

    // Create marker
    new mapboxgl.Marker({ color: "#3B82F6" })
      .setLngLat([location.longitude, location.latitude])
      .setPopup(popup)
      .addTo(map.value!);
  });
}

// Clean up
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

// Expose methods if needed
defineExpose({
  addMarker: (location: LocationData) => {
    if (!map.value) return;

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${location.name}</h3>`
    );

    new mapboxgl.Marker()
      .setLngLat([location.longitude, location.latitude])
      .setPopup(popup)
      .addTo(map.value);
  },
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
